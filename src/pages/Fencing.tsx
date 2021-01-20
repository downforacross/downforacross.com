import React, {useEffect, useState} from 'react';
import _ from 'lodash';
import {Helmet} from 'react-helmet';
import {RouteComponentProps} from 'react-router';

import {UserPingRoomEvent} from '../shared/roomEvents';
import {useSocket} from '../sockets/useSocket';
import {emitAsync} from '../sockets/emitAsync';
import {makeStyles} from '@material-ui/core';
import Player from '../components/Player';

import {gameReducer, GameState, initialGameState} from '../lib/reducers/gameV2';
import {GameEvent} from '../shared/gameEvents';

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
const Fencing: React.FC<RouteComponentProps<{gid: string}>> = (props) => {
  const gid = props.match.params.gid;
  const socket = useSocket();
  const [events, setEvents] = useState<GameEvent[]>([]);

  async function sendUserPing() {
    if (socket) {
      const event = UserPingRoomEvent();
      emitAsync(socket, 'game_event', {gid, event});
    }
  }
  useEffect(() => {
    setEvents([]);
    const {syncPromise, unsubscribe} = subscribeToGameEvents(socket, gid, setEvents);
    syncPromise.then(sendUserPing);
    return unsubscribe;
  }, [gid, socket]);
  const classes = useStyles();
  const gameState = useGameState(events);
  const playerProps = {
    beta: true,
    size: 35,
    grid: gameState.grid,
    solution: null,
    opponentGrid: null,
    circles: null,
    shades: null,
    clues: {
      across: null,
      down: null,
    },
    id: null,
    cursors: null,
    pings: null,
    users: null,
    frozen: null,
    myColor: null,
    updateGrid: null,
    updateCursor: null,
    addPing: null,
    onPressEnter: null,
    onPressPeriod: null,
    vimMode: null,
    vimInsert: null,
    onVimInsert: null,
    onVimNormal: null,
    mobile: null,
    pickups: null,
    optimisticCounter: null,
  };
  return (
    <div className={classes.container}>
      <Helmet title={`Fencing ${gid}`} />
      <h1>Welcome to fencing</h1>
      <Player {...playerProps} />
    </div>
  );
};
export default Fencing;
