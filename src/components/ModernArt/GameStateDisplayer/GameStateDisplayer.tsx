/* eslint-disable @typescript-eslint/no-use-before-define */
import React, {useState} from 'react';
import {makeStyles} from '@material-ui/core';
import _ from 'lodash';
import {PlayerActions} from '../usePlayerActions';
import {ModernArtState, AuctionType, AuctionStatus, colors, painters, rgbColors} from '../events/types';
import {Log} from './Log';
import Confetti from '../../Game/Confetti';
import {FaRobot, FaGavel, FaTag, FaEye, FaStar, FaLock} from 'react-icons/fa';
import {BiAddToQueue} from 'react-icons/bi';
// import { MdGavel  } from 'react-icons/md';

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
import {NONAME} from 'dns';

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

  const players = _.values(gameState.players);
  const viewerPlayer = gameState.players[playerId];

  const [currentBid, setCurrentBid] = useState(0);

  const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const number = Number(e.currentTarget.value);
    setCurrentBid(number);
  };

  const submitBid = () => {
    actions.submitBid(currentBid);
  };

  const skipBid = () => {
    actions.skipBid();
  };

  const finishAuction = () => {
    actions.finishAuction();
  };

  return (
    <div className={classes.gameStateDisplayerContainer}>
      <div className={classes.row}>
        <div className={classes.column} style={{marginRight: '4%'}}>
          {/* Played cards */}
          <div>
            {_.values(gameState.players).map((player) => {
              const arts = gameState.rounds[gameState.roundIndex].players[player.id]?.acquiredArt;
              return (
                <div className={classes.floatPlayer}>
                  {player.id === _.keys(gameState.players)[gameState.playerIdx] && <div>🎲(turn)🎲</div>}
                  {viewerPlayer?.id === player.id && <div>✨(you)✨</div>}
                  <div>{player.name}</div>

                  <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly'}}>
                    <FaRobot className={classes.playerIcon} />
                    {/* <div className={classes.playerIcon}> {player.icon} </div> */}
                    {arts?.map((a) => (
                      <div className={classes.acquiredArtCircle} style={{backgroundColor: a.color}}></div>
                    ))}
                    <div className={classes.playerSpacing}></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className={classes.sectionSpacing}></div>

          {/* Current Auction */}
          {gameState.currentAuction && (
            <div className={classes.auctionStatus}>
              <div className={classes.sectionHeader}>Current Auction</div>
              <div className={classes.rowFlex}>
                <div className={classes.auctionPhoto}>
                  <img src={Kadinsky1} className={classes.artImageBig}></img>
                  <div
                    className={classes.auctionIconBackgroundBig}
                    style={{backgroundColor: gameState.currentAuction.painting.color}}
                  >
                    {gameState.currentAuction.painting.auctionType == AuctionType.OPEN && (
                      <FaEye className={classes.auctionIconBig} />
                    )}
                    {gameState.currentAuction.painting.auctionType == AuctionType.ONE_OFFER && (
                      <FaStar className={classes.auctionIconBig} />
                    )}
                    {gameState.currentAuction.painting.auctionType == AuctionType.FIXED && (
                      <FaTag className={classes.auctionIconBig} />
                    )}
                    {gameState.currentAuction.painting.auctionType == AuctionType.DOUBLE && (
                      <BiAddToQueue className={classes.auctionIconBig} />
                    )}
                    {gameState.currentAuction.painting.auctionType == AuctionType.HIDDEN && (
                      <FaLock className={classes.auctionIconBig} />
                    )}
                  </div>
                </div>
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

                    {gameState.currentAuction.painting.auctionType === AuctionType.ONE_OFFER && (
                      <tr className={classes.tr}>
                        {/* Current Bidder is a better display name */}
                        <td className={classes.td}>Active Bidder</td>
                        <td className={classes.td}>
                          {gameState.currentAuction.activeBidder
                            ? gameState.players[gameState.currentAuction.activeBidder].name
                            : 'Nobody'}
                        </td>
                      </tr>
                    )}

                    <tr className={classes.tr}>
                      <td className={classes.td}>Your Bank</td>
                      <td className={classes.td}>${gameState.players[viewerPlayer.id].money}</td>
                    </tr>
                  </table>
                  {gameState.currentAuction.status === AuctionStatus.PENDING && (
                    <span className={classes.submitBidForm}>
                      <input type="text" onChange={handleInputChange} value={currentBid || ''} />
                      <button onClick={submitBid}> Submit Bid </button>
                      {/* todo: only show this for auctioneer */}
                      <button onClick={finishAuction}>
                        End Auction <FaGavel />
                      </button>
                    </span>
                  )}
                </div>
              </div>
              {gameState.currentAuction.status === AuctionStatus.PENDING &&
                gameState.currentAuction.painting.auctionType === AuctionType.ONE_OFFER && (
                  <button onClick={skipBid}> Skip Bid </button>
                )}
              {gameState.currentAuction?.status === AuctionStatus.CLOSED && <Confetti duration={1500} />}
            </div>
          )}

          <div className={classes.sectionSpacing}></div>

          {/* Cards */}
          <div className={classes.playerCards}>
            <div className={classes.sectionHeader}>Cards to Auction</div>
            <div>
              <div className={classes.cards}>
                {(viewerPlayer?.cards || []).map((card, j) => (
                  <div className={classes.card}>
                    <div>
                      <div
                        onClick={() => {
                          actions.startAuction(j);
                        }}
                      >
                        <img src={Kadinsky1} className={classes.artImage}></img>
                        <div className={classes.auctionIconBackground} style={{backgroundColor: card.color}}>
                          {card.auctionType == AuctionType.OPEN && <FaEye className={classes.auctionIcon} />}
                          {card.auctionType == AuctionType.ONE_OFFER && (
                            <FaStar className={classes.auctionIcon} />
                          )}
                          {card.auctionType == AuctionType.FIXED && <FaTag className={classes.auctionIcon} />}
                          {card.auctionType == AuctionType.DOUBLE && (
                            <BiAddToQueue className={classes.auctionIcon} />
                          )}
                          {card.auctionType == AuctionType.HIDDEN && (
                            <FaLock className={classes.auctionIcon} />
                          )}
                        </div>
                        {/* default */}
                        {viewerPlayer.id === _.keys(gameState.players)[gameState.playerIdx] &&
                          gameState.currentAuction?.status !== AuctionStatus.PENDING && (
                            <button
                              onClick={() => {
                                actions.startAuction(j);
                              }}
                            >
                              {' '}
                              Play{' '}
                            </button>
                          )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className={classes.column} style={{marginLeft: '4%'}}>
          {/* Game board */}
          <div>
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

          {/* need to be moved */}
          {!gameState.started && (
            <div className={classes.startButton}>
              Click Start!
              <button onClick={actions.startGame}>Start!</button>
            </div>
          )}
          {gameState.started && !gameState.roundStarted && (
            <div className={classes.nextButton}>
              <button onClick={actions.step}>Deal!</button>
            </div>
          )}

          {gameState.started && <div>Game has Started</div>}
        </div>
      </div>
    </div>
  );
  // todo hammer
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
  auctionIconBackgroundBig: {
    display: 'flex',
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: '48px',
    height: '48px',
    marginTop: '-48px',
  },
  auctionIconBig: {
    width: '32px',
    height: '32px',
    position: 'absolute',
    color: '#ffffff',
  },
  auctionIconBackground: {
    display: 'flex',
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: '32px',
    height: '32px',
    marginTop: '-32px',
  },
  auctionIcon: {
    width: '24px',
    height: '24px',
    position: 'absolute',
    color: '#ffffff',
  },
  card: {
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
  playerCards: {
    display: 'flex',
    flexDirection: 'column',
    '& > div': {
      padding: 12,
    },
  },
  cards: {
    display: 'flex',
    flexDirection: 'row',
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
    '& > *': {
      marginTop: 8,
    },
  },
  submitBidForm: {
    display: 'flex',
    '& > button': {
      marginLeft: 4,
    },
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    flex: '50%',
  },
  row: {
    display: 'flex',
  },
  table: {
    border: '0px solid black',
    // padding: '10px',
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
    width: '72px',
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
    width: '15%',
    float: 'left',
    padding: '8px',
  },
  floatPlayer: {
    display: 'flex',
    flexDirection: 'column',
    width: '30%',
    float: 'left',
    padding: '8px',
  },
  playerIcon: {
    width: '48px',
    height: '48px',
  },
  acquiredArtCircle: {
    display: 'flex',
    width: '16px',
    height: '16px',
    borderRadius: '50%',
  },
  sectionHeader: {
    justifyContent: 'center',
    width: '100%',
    height: '32px',
    fontFamily: 'Roboto',
    fontStyle: 'normal',
    fontSize: '24px',
  },
  sectionSpacing: {
    display: 'flex',
    width: '100%',
    height: '32px',
  },
  playerSpacing: {
    width: '32px',
    height: '8px',
  },
  auctionPhoto: {
    width: '144px',
    height: '200px',
    overflow: 'hidden',
  },
  rowFlex: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
  },
});
