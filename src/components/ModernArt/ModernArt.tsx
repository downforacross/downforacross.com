/* eslint-disable @typescript-eslint/no-use-before-define */
import React, {useState} from 'react';
import {useUpdateEffect} from 'react-use';
import {Helmet} from 'react-helmet';
import {makeStyles} from '@material-ui/core';
import _ from 'lodash';
import {useSocket} from '../../sockets/useSocket';
import {emitAsync} from '../../sockets/emitAsync';
import {usePlayerActions} from './usePlayerActions';
import {getUser} from '../../store/user';
import {useGameState} from './useGameState';
import {ModernArtEvent} from './events/types';
import {GameStateDisplayer} from './GameStateDisplayer/GameStateDisplayer';

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

  async function sendEvent(event: ModernArtEvent) {
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
  }

  // these lines could be `const events = useGameEvents()`
  const [events, setEvents] = useState<ModernArtEvent[]>([]);
  useUpdateEffect(() => {
    setEvents([]);
    const {syncPromise, unsubscribe} = subscribeToGameEvents(socket, gid, setEvents);
    const icons = ['🤨', '🧐', '🥺'];
    console.log('subscribing', syncPromise);
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
    syncPromise.then(() =>
      sendEvent({
        type: 'update_name',
        params: {
          id: getUser().id,
          name: names[Math.floor(Math.random() * names.length)],
          icon: icons[Math.floor(Math.random() * icons.length)],
        },
      })
    );
    return unsubscribe;
  }, [gid, socket]);

  const classes = useStyles();
  const gameState = useGameState(events);
  console.log('Events', events);
  console.log('Game State:', gameState);

  const userId = getUser().id;
  const actions = usePlayerActions(sendEvent, userId);
  return (
    <div className={classes.container}>
      <Helmet title={`Modern Art ${gid}`} />
      <h1>Welcome to modern art</h1>
      <GameStateDisplayer gameState={gameState} playerActions={actions} userId={userId} />
    </div>
  );
};

const useStyles = makeStyles({
  container: {
    display: 'flex',
    height: '100%',
    flexDirection: 'column',
  },
  startButton: {
    display: 'flex',
    flexDirection: 'column',
  },
  nextButton: {
    display: 'flex',
    flexDirection: 'column',
  },
  message: {
    display: 'flex',
    flexDirection: 'column',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: 100,
    height: 200,
    backgroundColor: '#CCC',
    color: '#333',
    fontSize: 24,
    marginLeft: 24,
    '&:hover button': {
      display: 'block',
    },
    '& button': {
      display: 'none',
    },
  },
  cardHeader: {
    height: 50,
    alignSelf: 'stretch',
  },

  usersList: {
    display: 'flex',
    flexDirection: 'column',
    '& div': {
      padding: 12,
    },
  },
  cards: {
    display: 'flex',
  },
});
