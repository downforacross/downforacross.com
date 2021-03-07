/* eslint-disable @typescript-eslint/no-use-before-define */
import React, {useState} from 'react';
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
  const {gameState, playerActions: actions} = props;

  const users = _.values(gameState.users);

  const [currentBid, setCurrentBid] = useState(0);

  const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const number = Number(e.currentTarget.value);
    setCurrentBid(number);
  };

  const submitBid = () => {
    actions.submitBid(currentBid);
  };

  const finishAuction = () => {
    actions.finishAuction();
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
        {users.length} users here
        {users.map((user, i) => (
          <div key={i}>
            {user.icon}
            {user.name}
            <div className={classes.cards}>
              {user.cards.map((card, j) => (
                <div className={classes.card}>
                  <div className={classes.cardHeader} style={{backgroundColor: card.color}} />
                  <div className={classes.cardBody}>
                    <div>{card.auctionType}</div>
                    {user.id === props.userId && (
                      <button
                        onClick={() => {
                          actions.startAuction(j);
                        }}
                      >
                        Play
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {gameState.currentAuction && (
        <div>
          <h1>
            Player {gameState.users[gameState.currentAuction.auctioneer]?.name} is holding a{' '}
            {gameState.currentAuction.painting.auctionType} auction for a{' '}
            {gameState.currentAuction.painting.color} painting
          </h1>
          {gameState.currentAuction.painting.auctionType === AuctionType.OPEN && (
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
          {gameState.currentAuction.status === AuctionStatus.CLOSED && (
            <div>
              <h1>
                Player {gameState.currentAuction.highestBidder} won painting{' '}
                {gameState.currentAuction.painting.color}
                for {gameState.currentAuction.highestBid}
              </h1>
            </div>
          )}
        </div>
      )}
      <div>
        <button onClick={finishAuction}> Finish Auction </button>
      </div>
    </div>
  );
};

const useStyles = makeStyles({
  gameStateDisplayerContainer: {
    display: 'flex',
    height: '100%',
    flexDirection: 'column',
    alignItems: 'center',
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
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: 40,
    height: 80,
    backgroundColor: '#CCC',
    color: '#333',
    marginLeft: 10,
    '& button': {
      fontSize: '10pt',
    },
    fontSize: '10pt',
  },
  cardHeader: {
    height: 40,
    alignSelf: 'stretch',
  },
  cardBody: {
    marginTop: 8,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  usersList: {
    display: 'flex',
    flexDirection: 'column',
    '& > div': {
      padding: 12,
    },
  },
  cards: {
    display: 'flex',
  },
});
