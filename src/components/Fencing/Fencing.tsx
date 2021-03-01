import _ from 'lodash';
import React, {useRef, useState} from 'react';
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
import {useToolbarActions} from './useToolbarActions';
import {GameEvent} from '../../shared/gameEvents/types/GameEvent';
import {GameState} from '../../shared/gameEvents/types/GameState';
import {getUser} from '../../store/user';
import {FencingScoreboard} from './FencingScoreboard';
import {TEAM_IDS} from '../../shared/gameEvents/constants';
import {FencingToolbar} from './FencingToolbar';
import nameGenerator from '../../lib/nameGenerator';

function insertEvent(events: GameEvent[], event: GameEvent) {
  let idx = events.length;
  while (idx - 1 >= 0 && event.timestamp! < events[idx - 1]!.timestamp!) {
    idx -= 1;
  }
  events.splice(idx, 0, event);
  return events;
}

function subscribeToGameEvents(
  socket: SocketIOClient.Socket | undefined,
  gid: string,
  events: React.MutableRefObject<GameEvent[]>,
  setEventsVersion: React.Dispatch<React.SetStateAction<number>>
) {
  let connected = false;
  async function joinAndSync() {
    if (!socket) return;
    await emitAsync(socket, 'join_game', gid);
    socket.on('game_event', (event: any) => {
      if (!connected) return;
      insertEvent(events.current, event); // NOTE THIS MUTATES events but that's for perf reasons
      setEventsVersion(events.current.length);
    });
    const allEvents: GameEvent[] = (await emitAsync(socket, 'sync_all_game_events', gid)) as any;
    events.current = allEvents;
    setEventsVersion(events.current.length);

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
  const events = useRef<GameEvent[]>([]);
  const [eventsVersion, setEventsVersion] = useState<number>(events.current.length);
  const [isInitialized, setIsInitialized] = useState(false);
  useUpdateEffect(() => {
    events.current = [];
    const {syncPromise, unsubscribe} = subscribeToGameEvents(socket, gid, events, setEventsVersion);
    syncPromise.then(() => {
      setIsInitialized(true);
    });
    setEventsVersion(events.current.length);
    return unsubscribe;
  }, [gid, socket]);
  const gameState = useGameState(events.current);

  const id = getUser().id;
  const teamId = gameState.users[id]?.teamId;

  useUpdateEffect(() => {
    if (isInitialized) {
      console.log('initializing for the first time', id, teamId);
      if (!gameState.users[id]?.displayName) {
        sendEvent({
          type: 'updateDisplayName',
          params: {
            id,
            displayName: nameGenerator(),
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
  console.log('Events', events.current, eventsVersion);
  console.log('Game State:', gameState);

  const toolbarActions = useToolbarActions(sendEvent, gameState, id);
  const playerActions = usePlayerActions(sendEvent, id);

  return (
    <div className={classes.container}>
      <Helmet title={`Fencing ${gid}`} />
      <div className={classes.scoreboardContainer}>
        <FencingScoreboard gameState={gameState} />
      </div>
      {gameState.loaded && (
        <div>
          <FencingToolbar toolbarActions={toolbarActions} />
          <Player
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...transformGameToPlayerProps(
              gameState.game!,
              _.values(gameState.users),
              playerActions,
              id,
              teamId
            )}
          />
        </div>
      )}
      {!gameState.loaded && <div>Loading your game...</div>}
    </div>
  );
};
