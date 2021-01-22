import React, {useEffect, useState} from 'react';
import {Helmet} from 'react-helmet';
import {UserPingRoomEvent} from '../../shared/roomEvents';
import {useSocket} from '../../sockets/useSocket';
import {emitAsync} from '../../sockets/emitAsync';
import {makeStyles} from '@material-ui/core';
import Player from '../Player';
import {gameReducer, GameState, initialGameState} from '../../lib/reducers/gameV2';
import {GameEvent} from '../../shared/gameEvents';
import {transformGameToPlayerProps} from './transformGameToPlayerProps';
import {usePlayerActions} from './usePlayerActions';

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
    flexDirection: 'column',
  },
});
/**
 * Computes the current game state, given a list of events.
 * @param events list of events
 */
const useGameState = (events: GameEvent[]): GameState => {
  // TODO use memoization
  // (a data structure!!! that uses sqrt n bucketing to avoid re-evaluating the "sum" of a list from scratch every time it is appended to)
  // "a time traveling data structure" aka persistent array reduction
  return events.reduce<GameState>(gameReducer, initialGameState);
};
/**
 * This component is parallel to Game -- will render a <Player/>
 * Will implement custom competitive crossword logic (see PR #145)
 * @param props
 */
export const Fencing: React.FC<{gid: string}> = (props) => {
  const gid = props.gid;
  const socket = useSocket();

  async function sendUserPing() {
    if (socket) {
      const event = UserPingRoomEvent();
      emitAsync(socket, 'game_event', {gid, event});
    }
  }

  // these lines could be `const events = useGameEvents()`
  const [events, setEvents] = useState<GameEvent[]>([]);
  useEffect(() => {
    setEvents([]);
    const {syncPromise, unsubscribe} = subscribeToGameEvents(socket, gid, setEvents);
    syncPromise.then(sendUserPing);
    return unsubscribe;
  }, [gid, socket]);

  const classes = useStyles();
  const gameState = useGameState(events);

  console.log('Events', events);
  console.log('Game State:', gameState);

  const playerStateHook = usePlayerActions(socket);

  return (
    <div className={classes.container}>
      <Helmet title={`Fencing ${gid}`} />
      <h1>Welcome to fencing</h1>
      {gameState.loaded && <Player {...transformGameToPlayerProps(gameState.game!, playerStateHook)} />}
      {!gameState.loaded && <div>Loading your game...</div>}
    </div>
  );
};
