import _ from 'lodash';
import React, {useState} from 'react';
import {useUpdateEffect} from 'react-use';
import {Helmet} from 'react-helmet';
import {makeStyles} from '@material-ui/core';
import {useSocket} from '../../sockets/useSocket';
import {emitAsync} from '../../sockets/emitAsync';
import Player from '../Player';
import gameReducer from '../../shared/gameEvents/gameReducer';
import {initialState} from '../../shared/gameEvents/initialState';
import {transformGameToPlayerProps} from './transformGameToPlayerProps';
import {usePlayerActions} from './usePlayerActions';
import {GameEvent} from '../../shared/gameEvents/types/GameEvent';
import {GameState} from '../../shared/gameEvents/types/GameState';
import {getUser} from '../../store/user';
import {FencingScoreboard} from './FencingScoreboard';
import {TEAM_IDS} from '../../shared/gameEvents/constants';

function subscribeToGameEvents(
  socket: SocketIOClient.Socket | undefined,
  gid: string,
  setEvents: React.Dispatch<React.SetStateAction<GameEvent[]>>
) {
  let connected = false;
  async function joinAndSync() {
    if (!socket) return;
    await emitAsync(socket, 'join_game', gid);
    socket.on('game_event', (event: any) => {
      if (!connected) return;
      setEvents((events) => [...events, event]);
    });
    const allEvents: GameEvent[] = (await emitAsync(socket, 'sync_all_game_events', gid)) as any;
    setEvents(allEvents);
    connected = true;
  }
  function unsubscribe() {
    if (!socket) return;
    console.log('unsubscribing from game events...');
    emitAsync(socket, 'leave_game', gid);
  }
  const syncPromise = joinAndSync();

  return {syncPromise, unsubscribe};
}
const useStyles = makeStyles({
  container: {
    display: 'flex',
    height: '100%',
    padding: 24,
    flexDirection: 'column',
  },
  scoreboardContainer: {
    display: 'flex',
    justifyContent: 'space-around',
    paddingBottom: 12,
    marginBottom: 32,
    '& *': {
      borderCollapse: 'collapse',
    },
    borderBottom: '1px solid black', // TODO find a designer
  },
});
/**
 * Computes the current game state, given a list of events.
 * @param events list of events
 */
const useGameState = (events: GameEvent[]): GameState =>
  // TODO use memoization
  // (a data structure!!! that uses sqrt n bucketing to avoid re-evaluating the "sum" of a list from scratch every time it is appended to)
  // "a time traveling data structure" aka persistent array reduction
  events.reduce<GameState>(gameReducer, initialState);

/**
 * This component is parallel to Game -- will render a <Player/>
 * Will implement custom competitive crossword logic (see PR #145)
 */
export const Fencing: React.FC<{gid: string}> = (props) => {
  const {gid} = props;
  const socket = useSocket();

  async function sendEvent(event: GameEvent) {
    (event as any).timestamp = {
      '.sv': 'timestamp',
    };
    console.log('sending event', socket, event);
    if (socket) {
      emitAsync(socket, 'game_event', {gid, event});
    } else {
      console.warn('Cannot send event; not connected to server');
    }
  }

  // these lines could be `const events = useGameEvents()`
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  useUpdateEffect(() => {
    setEvents([]);
    const {syncPromise, unsubscribe} = subscribeToGameEvents(socket, gid, setEvents);
    syncPromise.then(() => {
      setIsInitialized(true);
    });
    return unsubscribe;
  }, [gid, socket]);
  const gameState = useGameState(events);

  const id = getUser().id;
  const teamId = gameState.users[id]?.teamId;

  useUpdateEffect(() => {
    if (isInitialized) {
      if (!gameState.users[id]?.displayName) {
        sendEvent({
          type: 'updateDisplayName',
          params: {
            id,
            displayName: 'Hello!',
          },
        });
      }
      if (!teamId) {
        const nTeamId = _.minBy(
          TEAM_IDS,
          (t) => _.filter(_.values(gameState.users), (user) => user.teamId === t).length
        )!;
        sendEvent({
          type: 'updateTeamId',
          params: {
            id,
            teamId: nTeamId,
          },
        });
      }
    }
  }, [isInitialized]);

  const classes = useStyles();

  console.log('Events', events);
  console.log('Game State:', gameState);

  const playerStateHook = usePlayerActions(sendEvent, id);

  return (
    <div className={classes.container}>
      <Helmet title={`Fencing ${gid}`} />
      <div className={classes.scoreboardContainer}>
        <FencingScoreboard gameState={gameState} />
      </div>
      {gameState.loaded && (
        <Player {...transformGameToPlayerProps(gameState.game!, playerStateHook, teamId)} />
      )}
      {!gameState.loaded && <div>Loading your game...</div>}
    </div>
  );
};
