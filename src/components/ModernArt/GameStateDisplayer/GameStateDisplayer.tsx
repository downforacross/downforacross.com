/* eslint-disable @typescript-eslint/no-use-before-define */
import React, {useState} from 'react';
import {Helmet} from 'react-helmet';
import {makeStyles} from '@material-ui/core';
import _ from 'lodash';
import {PlayerActions} from '../usePlayerActions';
import {ModernArtState, AuctionType, AuctionStatus} from '../events/types';

/**
 * This component is parallel to Game -- will render a <Player/>
 * Will implement custom competitive crossword logic (see PR #145)
 * @param props
 */
export const GameStateDisplayer: React.FC<{
  gameState: ModernArtState;
  playerActions: PlayerActions;
  userId: string;
}> = (props) => {
  const classes = useStyles();
  const gameState = props.gameState;

  const actions = props.playerActions;
  const users = _.values(gameState.users);

  const [currentBid, setCurrentBid] = useState(0);

  const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const number = Number(e.currentTarget.value);
    setCurrentBid(number);
  };

  const submitBid = () => {
    actions.submitBid(props.userId, currentBid);
    window.alert('current bid is ' + currentBid);
  };

  const finishAuction = () => {
    actions.finishAuction();
    window.alert('auction is finished!');
  };

  return (
    <div className={classes.gameStateDisplayerContainer}>
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
      {gameState.currentAuction && (
        <div>
          <h1>
            Player {gameState.users[gameState.currentAuction.auctioneer]?.name} is holding a{' '}
            {gameState.currentAuction.auctionType} auction for a {gameState.currentAuction.painting.painter}{' '}
            painting
          </h1>
          {gameState.currentAuction.auctionType == AuctionType.OPEN && (
            <h3>
              Highest Bid is currently {gameState.currentAuction.highestBid} by user{' '}
              {gameState.currentAuction.highestBidder}{' '}
            </h3>
          )}

          {gameState.currentAuction.status === AuctionStatus.PENDING && (
            <div>
              <input type="text" onChange={handleInputChange} value={currentBid || ''} />
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
  gameStateDisplayerContainer: {
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
