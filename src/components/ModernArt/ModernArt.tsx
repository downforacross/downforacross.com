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
import {AuctionStatus, AuctionType, ModernArtEvent} from './events/types';

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

  const actions = usePlayerActions(sendEvent);
  const users = _.values(gameState.users);

  const [currentBid, setCurrentBid] = useState(0);

  const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const number = Number(e.currentTarget.value);
    setCurrentBid(number);
  };

  const submitBid = () => {
    actions.submitBid(getUser().id, currentBid);
    window.alert('current bid is ' + currentBid);
  };

  const finishAuction = () => {
    actions.finishAuction();
    window.alert('auction is finished!');
  };

  return (
    <div className={classes.container}>
      <Helmet title={`Modern Art ${gid}`} />
      <h1>Welcome to modern art</h1>
      {!gameState.started && (
        <div className={classes.startButton}>
          Click Start!
          <button onClick={actions.startGame}>Start!</button>
        </div>
      )}
      <div className={classes.nextButton}>
        <button onClick={actions.step}>Next!</button>
      </div>
      {gameState.started && <div className={classes.message}>Game has Started</div>}
      <div className={classes.usersList}>
        {users.length}
        users here
        {users.map((user, i) => (
          <div key={i}>
            {user.icon}
            {user.name}
            <div className={classes.cards}>
              {user.cards.map((card, i) => (
                <div className={classes.card}>
                  <div className={classes.cardHeader} style={{backgroundColor: card.color}} />
                  {card.auctionType}
                  <button
                    onClick={() => {
                      actions.startAuction(user.id, i);
                    }}
                  >
                    Play this card
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {!gameState.started && <div>Click Start!</div>}
      {gameState.started && <div>Game as Started</div>}
      {users.length}
      users here
      {users.map((user, i) => (
        <div key={i}>{user.name}</div>
      ))}
      {gameState.currentAuction.auctionType == AuctionType.HIDDEN && (
        <div>
          <h1>
            Player {gameState.currentAuction.auctioneer} is holding a {gameState.currentAuction.auctionType}{' '}
            auction for a painting {gameState.currentAuction.painting.painter}
          </h1>
          <input type="number" onChange={handleInputChange} value={currentBid} />
          <button onClick={submitBid}> Submit Bid </button>
        </div>
      )}
      {gameState.currentAuction.auctionType == AuctionType.OPEN && (
        <div>
          <h1>
            Player {gameState.currentAuction.auctioneer} is holding a {gameState.currentAuction.auctionType}{' '}
            auction for a painting {gameState.currentAuction.painting.painter}
          </h1>
          <h1>
            Highest Bid is currently {gameState.currentAuction.highestBid} by user{' '}
            {gameState.currentAuction.highestBidder}{' '}
          </h1>
          <input type="number" onChange={handleInputChange} value={currentBid} />
          <button onClick={submitBid}> Submit Bid </button>
        </div>
      )}
      {gameState.currentAuction.status == AuctionStatus.CLOSED && (
        <div>
          <h1>
            Player {gameState.currentAuction.highestBidder} won painting{' '}
            {gameState.currentAuction.painting.painter}
            for {gameState.currentAuction.highestBid}
          </h1>
        </div>
      )}
      {
        <div>
          <button onClick={finishAuction}> Finish Auction </button>
        </div>
      }
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
