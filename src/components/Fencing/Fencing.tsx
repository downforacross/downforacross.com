import React, {useEffect, useState} from 'react';
import {Helmet} from 'react-helmet';
import {UserPingRoomEvent} from '../../shared/roomEvents';
import {useSocket} from '../../sockets/useSocket';
import {emitAsync} from '../../sockets/emitAsync';
import {makeStyles} from '@material-ui/core';
import Player from '../Player';
import {gameReducer, GameState, initialGameState} from '../../lib/reducers/gameV2';
import {GameEvent} from '../../shared/gameEvents';
import {transformGameStateToPlayerProps} from './transformGameStateToPlayerProps';
// Top Down Development / Implementation: First implement the skeleton of the code before filling out the details
// You might invoke a helper function before actually filling it in, and just stub the implementation
function subscribeToGameEvents(
  socket: SocketIOClient.Socket | undefined,
  gid: string,
  setEvents: React.Dispatch<React.SetStateAction<GameEvent[]>>
) {
  // stub
  const syncPromise = (async () => {})();
  const unsubscribe = () => {};
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

  const playerProps = transformGameStateToPlayerProps(gameState);

  return (
    <div className={classes.container}>
      <Helmet title={`Fencing ${gid}`} />
      <h1>Welcome to fencing</h1>
      <Player {...playerProps} />
    </div>
  );
};
