/* eslint-disable @typescript-eslint/no-use-before-define */
import React, {useState} from 'react';
import {makeStyles} from '@material-ui/core';
import _ from 'lodash';
import {PlayerActions} from '../usePlayerActions';
import {ModernArtState, AuctionType, AuctionStatus, Card, colors, painters, rgbColors} from '../events/types';
import {Log} from './Log';
import {Players} from './Players';
import Confetti from '../../Game/Confetti';
import '../../../pages/css/tailwind.css';

import {FaGavel, FaTag, FaEye, FaStar, FaLock} from 'react-icons/fa';
import {BiAddToQueue} from 'react-icons/bi';

import Kadinsky1 from '../resources/kadinsky-1.jpeg';
import Kadinsky2 from '../resources/kadinsky-2.jpeg';
import Kadinsky3 from '../resources/kadinsky-3.jpeg';
import Kadinsky4 from '../resources/kadinsky-4.jpeg';
import Kadinsky5 from '../resources/kadinsky-5.jpeg';
import Kadinsky6 from '../resources/kadinsky-6.jpeg';
import Kadinsky7 from '../resources/kadinsky-7.jpeg';
import Kadinsky8 from '../resources/kadinsky-8.jpeg';
import Kadinsky9 from '../resources/kadinsky-9.jpeg';
import Kadinsky10 from '../resources/kadinsky-10.jpeg';
import Kadinsky11 from '../resources/kadinsky-11.jpeg';
import Kadinsky12 from '../resources/kadinsky-12.jpeg';

import Degas1 from '../resources/degas-1.jpeg';
import Degas2 from '../resources/degas-2.jpeg';
import Degas3 from '../resources/degas-3.jpeg';
import Degas4 from '../resources/degas-4.jpeg';
import Degas5 from '../resources/degas-5.jpeg';
import Degas6 from '../resources/degas-6.jpeg';
import Degas7 from '../resources/degas-7.jpeg';
import Degas8 from '../resources/degas-8.jpeg';
import Degas9 from '../resources/degas-9.jpeg';
import Degas10 from '../resources/degas-10.jpeg';
import Degas11 from '../resources/degas-11.jpeg';
import Degas12 from '../resources/degas-12.jpeg';
import Degas13 from '../resources/degas-13.jpeg';

import Monet1 from '../resources/monet-1.jpeg';
import Monet2 from '../resources/monet-2.jpeg';
import Monet3 from '../resources/monet-3.jpeg';
import Monet4 from '../resources/monet-4.jpeg';
import Monet5 from '../resources/monet-5.jpeg';
import Monet6 from '../resources/monet-6.jpeg';
import Monet7 from '../resources/monet-7.jpeg';
import Monet8 from '../resources/monet-8.jpeg';
import Monet9 from '../resources/monet-9.jpeg';
import Monet10 from '../resources/monet-10.jpeg';
import Monet11 from '../resources/monet-11.jpeg';
import Monet12 from '../resources/monet-12.jpeg';
import Monet13 from '../resources/monet-13.jpeg';
import Monet14 from '../resources/monet-14.jpeg';

import VanEyk1 from '../resources/vaneyk-1.jpeg';
import VanEyk2 from '../resources/vaneyk-2.jpeg';
import VanEyk3 from '../resources/vaneyk-3.jpeg';
import VanEyk4 from '../resources/vaneyk-4.jpeg';
import VanEyk5 from '../resources/vaneyk-5.jpeg';
import VanEyk6 from '../resources/vaneyk-6.jpeg';
import VanEyk7 from '../resources/vaneyk-7.jpeg';
import VanEyk8 from '../resources/vaneyk-8.jpeg';
import VanEyk9 from '../resources/vaneyk-9.jpeg';
import VanEyk10 from '../resources/vaneyk-10.jpeg';
import VanEyk11 from '../resources/vaneyk-11.jpeg';
import VanEyk12 from '../resources/vaneyk-12.jpeg';
import VanEyk13 from '../resources/vaneyk-13.jpeg';
import VanEyk14 from '../resources/vaneyk-14.jpeg';
import VanEyk15 from '../resources/vaneyk-15.jpeg';

import Picasso1 from '../resources/picasso-1.jpeg';
import Picasso2 from '../resources/picasso-2.jpeg';
import Picasso3 from '../resources/picasso-3.jpeg';
import Picasso4 from '../resources/picasso-4.jpeg';
import Picasso5 from '../resources/picasso-5.jpeg';
import Picasso6 from '../resources/picasso-6.jpeg';
import Picasso7 from '../resources/picasso-7.jpeg';
import Picasso8 from '../resources/picasso-8.jpeg';
import Picasso9 from '../resources/picasso-9.jpeg';
import Picasso10 from '../resources/picasso-10.jpeg';
import Picasso11 from '../resources/picasso-11.jpeg';
import Picasso12 from '../resources/picasso-12.jpeg';
import Picasso13 from '../resources/picasso-13.jpeg';
import Picasso14 from '../resources/picasso-14.jpeg';
import Picasso15 from '../resources/picasso-15.jpeg';
import Picasso16 from '../resources/picasso-16.jpeg';
import {ClassNameMap} from '@material-ui/core/styles/withStyles';

const kadinskyArt = [
  Kadinsky1,
  Kadinsky2,
  Kadinsky3,
  Kadinsky4,
  Kadinsky5,
  Kadinsky6,
  Kadinsky7,
  Kadinsky8,
  Kadinsky9,
  Kadinsky10,
  Kadinsky11,
  Kadinsky12,
];

const degasArt = [
  Degas1,
  Degas2,
  Degas3,
  Degas4,
  Degas5,
  Degas6,
  Degas7,
  Degas8,
  Degas9,
  Degas10,
  Degas11,
  Degas12,
  Degas13,
];

const monetArt = [
  Monet1,
  Monet2,
  Monet3,
  Monet4,
  Monet5,
  Monet6,
  Monet7,
  Monet8,
  Monet9,
  Monet10,
  Monet11,
  Monet12,
  Monet13,
  Monet14,
];

const vaneykArt = [
  VanEyk1,
  VanEyk2,
  VanEyk3,
  VanEyk4,
  VanEyk5,
  VanEyk6,
  VanEyk7,
  VanEyk8,
  VanEyk9,
  VanEyk10,
  VanEyk11,
  VanEyk12,
  VanEyk13,
  VanEyk14,
  VanEyk15,
];

const picassoArt = [
  Picasso1,
  Picasso2,
  Picasso3,
  Picasso4,
  Picasso5,
  Picasso6,
  Picasso7,
  Picasso8,
  Picasso9,
  Picasso10,
  Picasso11,
  Picasso12,
  Picasso13,
  Picasso14,
  Picasso15,
  Picasso16,
];

const paintings: Record<string, any[]> = {
  Kadinsky: kadinskyArt,
  Degas: degasArt,
  Monet: monetArt,
  VanEyk: vaneykArt,
  Picasso: picassoArt,
};

const makeCurrentAuctionImg = (classes: ClassNameMap, painting: Card) => {
  return (
    <div className={classes.auctionPhoto}>
      <img
        src={paintings[painters[painting.color]][painting.paintingIndex]}
        className={classes.artImageBig}
      ></img>

      <div className={classes.auctionIconBackgroundBig} style={{backgroundColor: painting.color}}>
        {painting.auctionType === AuctionType.OPEN && <FaEye className={classes.auctionIconBig} />}
        {painting.auctionType === AuctionType.ONE_OFFER && <FaStar className={classes.auctionIconBig} />}
        {painting.auctionType === AuctionType.FIXED && <FaTag className={classes.auctionIconBig} />}
        {painting.auctionType === AuctionType.DOUBLE && <BiAddToQueue className={classes.auctionIconBig} />}
        {painting.auctionType === AuctionType.HIDDEN && <FaLock className={classes.auctionIconBig} />}
      </div>
    </div>
  );
};

/**
 * This component is parallel to Game -- will render a <Player/>
 * Will implement custom competitive crossword logic (see PR #145)
 * @param props
 */
export const GameStateDisplayer: React.FC<{
  gameState: ModernArtState;
  playerActions: PlayerActions;
  playerId: string;
}> = (props) => {
  const classes = useStyles();
  const {gameState, playerActions: actions, playerId} = props;

  const viewerPlayer = gameState.players[playerId];

  const [currentBid, setCurrentBid] = useState(0);
  const [fixedPrice, setFixedPrice] = useState(0);

  const handleBidChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const number = Number(e.currentTarget.value);
    setCurrentBid(number);
  };

  const handleFixedPriceChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const number = Number(e.currentTarget.value);
    setFixedPrice(number);
  };

  const playCard = (i: number) => {
    actions.startAuction(i);
  };

  const submitBid = () => {
    actions.submitBid(currentBid);
    setCurrentBid(0);
  };

  const waitingForFixedPrice = (gameState: ModernArtState) => {
    if (!gameState || !gameState.currentAuction) return false;
    return (
      gameState.currentAuction.painting.auctionType === AuctionType.FIXED &&
      gameState.currentAuction.fixedPrice === undefined
    );
  };

  const submitFixedPrice = () => {
    actions.submitFixedPrice(fixedPrice);
    setFixedPrice(0);
  };

  const acceptFixedPrice = () => {
    actions.acceptFixedPrice();
  };

  const skipBid = () => {
    actions.skipBid();
  };

  const skipDouble = () => {
    actions.skipDouble();
  };

  const finishAuction = () => {
    actions.finishAuction();
  };

  const copyGameLink = () => {
    var dummy = document.createElement('input'),
      text = window.location.href;

    document.body.appendChild(dummy);
    dummy.value = text;
    dummy.select();
    document.execCommand('copy');
    document.body.removeChild(dummy);
  };

  const recommendedActionStyle =
    'w-64 bg-gradient-to-r from-green-400 to-blue-500 hover:from-pink-500 hover:to-yellow-500 text-white font-medium my-2 py-2 px-4 rounded';
  const secondaryActionStyle = 'bg-blue-100 hover:bg-blue-200 my-2 py-2 px-4 rounded';
  const inputStyle = 'm-2 p-2 border-2 border-blue-100 rounded';

  const viewersTurnToPlayCard = gameState.currentDouble
    ? gameState.currentDouble.activePlayer === playerId
    : playerId === _.keys(gameState.players)[gameState.playerIdx] &&
      gameState.currentAuction?.status !== AuctionStatus.PENDING;
  return (
    <div>
      {!gameState.started && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '32px',
          }}
        >
          <Players gameState={gameState} viewerPlayer={viewerPlayer} playerActions={actions} />

          <div className={classes.sectionSpacing}></div>

          {Object.keys(gameState.players).length < 2 && (
            <button onClick={copyGameLink} className={recommendedActionStyle}>
              Copy game link
            </button>
          )}
          {Object.keys(gameState.players).length > 2 && (
            <button onClick={copyGameLink} className={secondaryActionStyle}>
              Copy game link
            </button>
          )}

          <div className={classes.sectionSpacing}></div>

          {Object.keys(gameState.players).length > 2 && (
            <button onClick={actions.startGame} className={recommendedActionStyle}>
              Start game
            </button>
          )}
        </div>
      )}

      {gameState.started && (
        <div className={classes.gameStateDisplayerContainer}>
          <div className={classes.column1} style={{marginRight: '4%'}}>
            <Players gameState={gameState} viewerPlayer={viewerPlayer} playerActions={actions} />

            <div className={classes.sectionSpacing}></div>

            {gameState.started && !gameState.roundStarted && (
              <div className={classes.nextButton}>
                <button onClick={actions.step} className={recommendedActionStyle}>
                  Deal!
                </button>
              </div>
            )}

            <div className={classes.sectionSpacing}></div>

            {/* Current Auction */}
            {gameState.currentDouble && (
              <div className={classes.auctionStatus}>
                <div className={classes.sectionHeader}>Double Played</div>
                <div className={classes.rowFlex}>
                  <div className={classes.auctionPhoto}>
                    <img
                      src={
                        paintings[painters[gameState.currentDouble.card.color]][
                          gameState.currentDouble.card.paintingIndex
                        ]
                      }
                      className={classes.artImageBig}
                    ></img>
                    <div
                      className={classes.auctionIconBackgroundBig}
                      style={{backgroundColor: gameState.currentDouble.card.color}}
                    >
                      <BiAddToQueue className={classes.auctionIconBig} />
                    </div>
                  </div>
                </div>
                {gameState.currentDouble.activePlayer === playerId && (
                  <span>
                    <div>It's your turn to play the second painting</div>
                    <button onClick={skipDouble}> Pass </button>
                  </span>
                )}
              </div>
            )}

            {gameState.currentAuction && !gameState.currentDouble && (
              <div className={classes.auctionStatus}>
                <div className={classes.sectionHeader}>
                  {gameState.currentAuction.status == AuctionStatus.PENDING
                    ? 'Current Auction'
                    : 'Auction Ended'}
                </div>
                <div className={classes.rowFlex}>
                  {makeCurrentAuctionImg(classes, gameState.currentAuction.painting)}
                  {gameState.currentAuction.double &&
                    makeCurrentAuctionImg(classes, gameState.currentAuction.double)}

                  <div>
                    <table className={classes.table}>
                      <tr className={classes.tr}>
                        <td className={classes.td}>Auctioneer</td>
                        <td className={classes.td}>
                          {gameState.players[gameState.currentAuction.auctioneer]?.name}
                        </td>
                      </tr>

                      {(gameState.currentAuction.painting.auctionType === AuctionType.OPEN ||
                        gameState.currentAuction.painting.auctionType === AuctionType.ONE_OFFER) && (
                        <tr className={classes.tr}>
                          <td className={classes.td}>Highest Bidder</td>
                          <td className={classes.td}>
                            {gameState.currentAuction.highestBidder
                              ? gameState.players[gameState.currentAuction.highestBidder].name
                              : 'Nobody'}
                          </td>
                        </tr>
                      )}

                      {(gameState.currentAuction.painting.auctionType === AuctionType.OPEN ||
                        gameState.currentAuction.painting.auctionType === AuctionType.ONE_OFFER) && (
                        <tr className={classes.tr}>
                          <td className={classes.td}>Highest Bid</td>
                          <td className={classes.td}>${gameState.currentAuction.highestBid}</td>
                        </tr>
                      )}

                      {gameState.currentAuction.painting.auctionType === AuctionType.FIXED && (
                        <tr className={classes.tr}>
                          <td className={classes.td}>Fixed Price</td>
                          <td className={classes.td}>${gameState.currentAuction.fixedPrice}</td>
                        </tr>
                      )}

                      {gameState.currentAuction.painting.auctionType === AuctionType.ONE_OFFER ||
                        (gameState.currentAuction.painting.auctionType === AuctionType.FIXED && (
                          <tr className={classes.tr}>
                            <td className={classes.td}>Active Bidder</td>
                            <td className={classes.td}>
                              {gameState.currentAuction.activeBidder
                                ? gameState.players[gameState.currentAuction.activeBidder].name
                                : 'Nobody'}
                            </td>
                          </tr>
                        ))}

                      <tr className={classes.tr}>
                        <td className={classes.td}>Your Bank</td>
                        <td className={classes.td}>
                          ${viewerPlayer ? gameState.players[viewerPlayer.id].money : 0}
                        </td>
                      </tr>
                    </table>

                    {waitingForFixedPrice(gameState) &&
                      viewerPlayer?.id === gameState.currentAuction.auctioneer && (
                        <span>
                          <input
                            className={inputStyle}
                            type="text"
                            onChange={handleFixedPriceChange}
                            value={fixedPrice || 0}
                          />
                          <button onClick={submitFixedPrice}> Submit </button>
                        </span>
                      )}

                    {waitingForFixedPrice(gameState) &&
                      viewerPlayer?.id !== gameState.currentAuction.auctioneer && (
                        <div>
                          Waiting for player {gameState.players[gameState.currentAuction.auctioneer].name} to
                          submit fixed price
                        </div>
                      )}

                    {![AuctionType.FIXED, AuctionType.ONE_OFFER].includes(
                      gameState.currentAuction.painting.auctionType
                    ) &&
                      gameState.currentAuction.status === AuctionStatus.PENDING && (
                        <span>
                          <input
                            className={inputStyle}
                            type="text"
                            onChange={handleBidChange}
                            value={currentBid || 0}
                          />
                          <button onClick={submitBid}> Submit Bid </button>
                        </span>
                      )}
                    {gameState.currentAuction.status === AuctionStatus.PENDING &&
                      gameState.currentAuction.painting.auctionType === AuctionType.ONE_OFFER &&
                      viewerPlayer?.id === gameState.currentAuction.activeBidder && (
                        <div>
                          <span>
                            <input
                              className={inputStyle}
                              type="text"
                              onChange={handleBidChange}
                              value={currentBid || 0}
                            />
                            <button onClick={submitBid}> Submit </button>
                          </span>
                          <span>
                            <button onClick={skipBid}> Skip </button>
                          </span>
                        </div>
                      )}

                    {gameState.currentAuction.painting.auctionType === AuctionType.FIXED &&
                      !waitingForFixedPrice(gameState) &&
                      gameState.currentAuction.status === AuctionStatus.PENDING &&
                      viewerPlayer?.id === gameState.currentAuction.activeBidder && (
                        <div>
                          <span>
                            <button onClick={acceptFixedPrice}> Accept </button>
                          </span>
                          <span>
                            <button onClick={skipBid}> Skip </button>
                          </span>
                        </div>
                      )}

                    {!waitingForFixedPrice(gameState) &&
                      gameState.currentAuction.status === AuctionStatus.PENDING &&
                      [AuctionType.HIDDEN, AuctionType.OPEN].includes(
                        gameState.currentAuction.painting.auctionType
                      ) &&
                      viewerPlayer?.id === gameState.currentAuction.auctioneer && (
                        <button onClick={finishAuction}>
                          End Auction <FaGavel />
                        </button>
                      )}
                  </div>
                </div>
                {gameState.currentAuction?.status === AuctionStatus.CLOSED && <Confetti duration={1500} />}
              </div>
            )}

            <div className={classes.sectionSpacing}></div>

            {/* Cards */}
            <div className={classes.playerCards}>
              {gameState.started && <div className={classes.sectionHeader}>Your Cards</div>}
              <div>
                <div className={classes.cards}>
                  {(viewerPlayer?.cards || []).map((card, j) => (
                    <div className={classes.card}>
                      <div>
                        <img
                          src={paintings[painters[card.color]][card.paintingIndex]}
                          className={classes.artImage}
                        ></img>
                        <div className={classes.auctionIconBackground} style={{backgroundColor: card.color}}>
                          {card.auctionType === AuctionType.OPEN && <FaEye className={classes.auctionIcon} />}
                          {card.auctionType === AuctionType.ONE_OFFER && (
                            <FaStar className={classes.auctionIcon} />
                          )}
                          {card.auctionType === AuctionType.FIXED && (
                            <FaTag className={classes.auctionIcon} />
                          )}
                          {card.auctionType === AuctionType.DOUBLE && (
                            <BiAddToQueue className={classes.auctionIcon} />
                          )}
                          {card.auctionType === AuctionType.HIDDEN && (
                            <FaLock className={classes.auctionIcon} />
                          )}
                        </div>
                        {/* default */}
                        {viewersTurnToPlayCard && (
                          <button
                            className="w-full m-0 mt-2"
                            onClick={() => {
                              playCard(j);
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
            </div>
          </div>

          <div className={classes.column2} style={{marginLeft: '4%'}}>
            {/* Game board */}
            <div style={{display: 'flex'}}>
              {colors.map((c) => (
                <div className={classes.floatChild}>
                  {painters[c]}
                  <div id={c} className={classes.gameBoardColumn} style={{backgroundColor: rgbColors[c]}}>
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        className={classes.gameBoardCircle}
                        style={{
                          backgroundColor:
                            gameState.rounds[i] && gameState.rounds[i].places ? '#ffffff' : rgbColors[c],
                        }}
                      >
                        {gameState.rounds[i] && gameState.rounds[i].places
                          ? gameState.rounds[i].places?.[c]
                          : ''}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className={classes.sectionSpacing}></div>

            {/* actions */}
            <Log log={gameState.log} />
          </div>
        </div>
      )}
    </div>
  );
};

const useStyles = makeStyles({
  gameStateDisplayerContainer: {
    display: 'flex',
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  startButton: {
    display: 'flex',
    flexDirection: 'column',
  },
  nextButton: {
    display: 'flex',
    flexDirection: 'column',
  },
  auctionIconBackgroundBig: {
    display: 'flex',
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: '48px',
    height: '48px',
    marginTop: '-48px',
    borderRadius: '4px',
  },
  auctionIconBig: {
    width: '32px',
    height: '32px',
    position: 'absolute',
    color: '#ffffff',
    borderRadius: '4px',
  },
  auctionIconBackground: {
    display: 'flex',
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: '32px',
    height: '32px',
    marginTop: '-32px',
    borderRadius: '4px',
  },
  auctionIcon: {
    width: '24px',
    height: '24px',
    position: 'absolute',
    color: '#ffffff',
    borderRadius: '4px',
  },
  card: {
    // marginLeft: 10,
    '& button': {
      fontSize: '10pt',
    },
    fontSize: '10pt',
    margin: '8px',
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
  playerCards: {
    display: 'flex',
    flexDirection: 'column',
    '& > div': {
      padding: 8,
    },
  },
  cards: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  artImageBig: {
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '4px',
    height: '200px',
    width: '136px',
  },
  artImage: {
    display: 'flex',
    flexDirection: 'column',
    filter: 'grayscale(1)',
    borderRadius: '4px',
    height: '104px',
    width: '72px',
  },
  auctionStatus: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    '& > div': {
      padding: 8,
    },
  },
  column1: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '45%',
    margin: '2%',
  },
  column2: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '35%',
    margin: '2%',
  },
  table: {
    border: '0px solid black',
  },
  th: {
    border: '0px solid black',
  },
  tr: {
    border: '0px solid black',
  },
  td: {
    border: '0px solid black',
  },
  gameBoardColumn: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    height: '240px',
    borderRadius: '4px',
  },
  gameBoardCircle: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: '3px solid #fff',
  },
  floatChild: {
    width: '20%',
    float: 'left',
    padding: '8px',
  },
  sectionHeader: {
    justifyContent: 'center',
    width: '100%',
    height: '24px',
    fontSize: '24px',
  },
  sectionSpacing: {
    display: 'flex',
    width: '100%',
    height: '32px',
  },
  auctionPhoto: {
    width: '144px',
    height: '200px',
    overflow: 'hidden',
    margin: '8px',
    borderRadius: '4px',
  },
  rowFlex: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
  },
});
