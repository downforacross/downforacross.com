/* eslint-disable @typescript-eslint/no-use-before-define */
import React, {useCallback, useState} from 'react';
import {useUpdateEffect} from 'react-use';
import {Helmet} from 'react-helmet';
import {makeStyles} from '@material-ui/core';
import {useSocket} from '../../sockets/useSocket';
import {emitAsync} from '../../sockets/emitAsync';
import {usePlayerActions} from './usePlayerActions';
import {getUser} from '../../store/user';
import {useGameState} from './useGameState';
import {ModernArtEvent} from './events/types';
import {GameStateDisplayer, icons} from './GameStateDisplayer/GameStateDisplayer';

function subscribeToGameEvents(
  socket: SocketIOClient.Socket | undefined,
  gid: string,
  setEvents: React.Dispatch<React.SetStateAction<ModernArtEvent[]>>
) {
  let connected = false;
  async function joinAndSync() {
    if (!socket) return;
    await emitAsync(socket, 'join_game', gid);
    socket.on('game_event', (event: any) => {
      if (!connected) return;
      setEvents((events) => [...events, event]);
    });
    const allEvents: ModernArtEvent[] = (await emitAsync(socket, 'sync_all_game_events', gid)) as any;
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

/**
 * This component is parallel to Game -- will render a <Player/>
 * Will implement custom competitive crossword logic (see PR #145)
 * @param props
 */
export const ModernArt: React.FC<{gid: string}> = (props) => {
  const {gid} = props;
  const socket = useSocket();
  const playerId = getUser().id;

  const sendEvent = useCallback(
    async (event: ModernArtEvent) => {
      console.log('send event', event);
      if (socket) {
        emitAsync(socket, 'game_event', {
          gid,
          event: {
            ...event,
            timestamp: {
              '.sv': 'timestamp',
            },
          },
        });
      } else {
        console.warn('Cannot send event; not connected to server');
      }
    },
    [socket]
  );

  // these lines could be `const events = useGameEvents()`
  const [events, setEvents] = useState<ModernArtEvent[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useUpdateEffect(() => {
    setEvents([]);
    const {syncPromise, unsubscribe} = subscribeToGameEvents(socket, gid, setEvents);
    syncPromise.then(() => setIsInitialized(true));

    return unsubscribe;
  }, [gid, socket]);

  useUpdateEffect(() => {
    const names = [
      'manuel',
      'melim',
      'sigrid',
      'ramon',
      'rafael',
      'daniel',
      'carvaliho',
      'thaler',
      'martins',
      'silveira',
    ];

    if (isInitialized) {
      if (!gameState.players[playerId]?.name) {
        sendEvent({
          type: 'update_name',
          params: {
            playerId,
            id: getUser().id,
            name: names[Math.floor(Math.random() * names.length)],
            iconIdx: Math.floor(Math.random() * icons.length),
          },
        });
      }
    }
  }, [isInitialized]);
  const classes = useStyles();
  const gameState = useGameState(events);
  console.log('Events', events);
  console.log('Game State:', gameState);

  const actions = usePlayerActions(sendEvent, playerId);
  return (
    <div className={classes.container}>
      <Helmet title={`Modern Art ${gid}`} />
      <div className={classes.header}>
        <div className={classes.title}>Modern Art</div>
      </div>
      {/* <div className={classes.spacing}></div> */}
      <GameStateDisplayer gameState={gameState} playerActions={actions} playerId={playerId} />
    </div>
  );
};

const useStyles = makeStyles({
  container: {
    display: 'flex',
    height: '100%',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    width: '100%',
    height: '72px',
    left: '0px',
    top: '0px',
    background: '#FFFFFF',
    boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
  },
  title: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    width: '100%',
    height: '72px',
    fontFamily: 'Roboto',
    fontStyle: 'normal',
    fontWeight: 'lighter',
    fontSize: '40px',
    lineHeight: '70%',
    letterSpacing: '0.1em',
    color: '#000000',
  },
  // spacing: {
  //   display: 'flex',
  //   width: '100%',
  //   height: '16px',
  // },
});
