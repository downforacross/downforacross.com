// @ts-ignore
import seedrandom from 'seedrandom';
import moment from 'moment';
import _ from 'lodash';
import {
  ModernArtState,
  ModernArtEvent,
  AuctionStatus,
  colors,
  AuctionType,
  turnBasedAuctions,
  ModernArtPlayer,
  Auction,
} from './types';

const getPlayerIdx = (state: ModernArtState, playerId: string) => {
  return Object.keys(state.players).indexOf(playerId);
};

const getPlayerId = (state: ModernArtState, playerIdx: number) => {
  return Object.keys(state.players)[playerIdx];
};

const nextIdx = (state: ModernArtState, playerIdx: number) => {
  return (playerIdx + 1) % Object.keys(state.players).length;
};

const nextPlayerId = (state: ModernArtState, playerId: string) => {
  return getPlayerId(state, nextIdx(state, getPlayerIdx(state, playerId)));
};

const finishAuction = (state: ModernArtState, finishedAt: number, finishedBy?: ModernArtPlayer) => {
  if (!state.currentAuction) return undefined;

  const auctioneer = state.currentAuction.auctioneer;

  // If no highestBidder, then painting goes to auctioneer
  const winner = state.currentAuction.highestBidder || auctioneer;
  if (!auctioneer || !winner) return undefined;
  const payment = state.currentAuction.highestBid || state.currentAuction.fixedPrice || 0;
  const painting = state.currentAuction.painting;

  if (state.players[winner].money < payment) return undefined;
  const hhmm = moment(finishedAt).format('hh:mm');
  return {
    ...state,
    playerIdx: (state.playerIdx + 1) % _.keys(state.players).length, // todo: fix for double auction edge cases
    players: {
      ...state.players,
      // warning: do not switch order of [auctioneer] and [winner] keys!
      // If auctioneer = winner, then the payment should only be subtracted
      [auctioneer]: {
        ...state.players[auctioneer],
        money: state.players[auctioneer].money + payment,
      },
      [winner]: {
        ...state.players[winner],
        money: state.players[winner].money - payment,
      },
    },
    rounds: {
      ...state.rounds,
      [state.roundIndex]: {
        ...state.rounds[state.roundIndex],
        players: {
          ...state.rounds[state.roundIndex]?.players,
          [winner]: {
            ...state.rounds[state.roundIndex]?.players[winner],
            acquiredArt: [...(state.rounds[state.roundIndex]?.players[winner]?.acquiredArt ?? []), painting],
          },
        },
      },
    },
    log: _.compact([
      ...state.log,
      finishedBy && {
        hhmm,
        text: `${finishedBy.name} finished the auction`,
      },
      {
        hhmm,
        text: `${state.players[winner].name} won the auction for ${payment} and acquired a ${painting.color}`,
      },
    ]),
    currentAuction: {
      ...state.currentAuction,
      status: AuctionStatus.CLOSED,
      winner,
      payment,
    },
  };
};
/**
 * A helper function that contains meat of reducer code.
 *
 * Returns undefined for invalid events
 */
export const modernArtReducerHelper = (
  state: ModernArtState,
  event: ModernArtEvent
): ModernArtState | undefined => {
  const playerId = event.params.playerId ?? event.params.id;
  const player = state.players[event.params.playerId];

  const timestamp = typeof event.timestamp === 'number' ? event.timestamp : Date.now();
  const hhmm = moment(timestamp).format('hh:mm');

  if (event.type === 'start_game') {
    return {
      ...state,
      started: true,
      playerIdx: 0,
      players: _.mapValues(state.players, (u) => ({
        ...u,
        money: 100,
      })),
      rounds: {
        '0': {
          auctions: [],
          players: _.mapValues(state.players, (u) => ({
            id: u.id,
            acquiredArt: [],
          })),
        },
      },
      log: [
        ...state.log,
        {
          hhmm,
          text: `Game started`,
        },
      ],
    };
  }
  if (event.type === 'submit_bid') {
    if (!state.currentAuction) return undefined;

    // if (event.params.bidAmount > (state.currentAuction.highestBid ?? 0)) {
    const stateAfterBid = {
      ...state,
      currentAuction: {
        ...state.currentAuction,
        highestBidder: event.params.playerId,
        highestBid: event.params.bidAmount,
        activeBidder:
          state.currentAuction.activeBidder && nextPlayerId(state, state.currentAuction.activeBidder),
      },
      log: [
        ...state.log,
        {
          hhmm,
          text:
            state.currentAuction.painting.auctionType === AuctionType.HIDDEN
              ? `${player.name} has submitted a bid`
              : `${player.name} has submitted a bid for ${event.params.bidAmount}`,
        },
      ],
    };
    if (
      turnBasedAuctions.includes(state.currentAuction.painting.auctionType) &&
      state.currentAuction.auctioneer === playerId
    ) {
      // the auction is over
      return finishAuction(stateAfterBid, timestamp);
    }
    return stateAfterBid;
    // }
  }
  if (event.type === 'finish_auction') return finishAuction(state, timestamp, player);
  if (event.type === 'update_name') {
    if (!player && state.started) {
      return undefined;
    }
    if (!playerId) {
      return undefined;
    }
    return {
      ...state,
      players: {
        ...state.players,
        [playerId]: {
          // @ts-ignore
          cards: [],
          ...state.players[playerId],
          name: event.params.name,
          iconIdx: event.params.iconIdx ? event.params.iconIdx : state.players[playerId].iconIdx,
          id: playerId,
        },
      },
      log: [
        ...state.log,
        {
          hhmm,
          text: player
            ? `${player.name} changed name to ${event.params.name}`
            : `${event.params.name} has entered the game`,
        },
      ],
    };
  }

  if (event.type === 'step') {
    // do the next automated step depending on the game state
    if (!state.roundStarted) {
      const prng = seedrandom(event.params.seed ?? 1);
      const CARDS_TO_DEAL: Record<string, number[] | undefined> = {
        1: [10, 10, 10],
        2: [10, 10, 10],
        3: [10, 10, 10],
        4: [9, 9, 9],
        5: [8, 8, 8],
      };

      const CARDS_TYPES_PER_COLOR: Record<string, AuctionType[]> = {
        yellow: _.concat(
          _.times(2, () => AuctionType.DOUBLE),
          _.times(2, () => AuctionType.FIXED),
          _.times(2, () => AuctionType.HIDDEN),
          _.times(3, () => AuctionType.OPEN),
          _.times(3, () => AuctionType.ONE_OFFER)
        ),
        blue: _.concat(
          _.times(2, () => AuctionType.DOUBLE),
          _.times(3, () => AuctionType.FIXED),
          _.times(3, () => AuctionType.HIDDEN),
          _.times(3, () => AuctionType.OPEN),
          _.times(2, () => AuctionType.ONE_OFFER)
        ),
        red: _.concat(
          _.times(2, () => AuctionType.DOUBLE),
          _.times(3, () => AuctionType.FIXED),
          _.times(3, () => AuctionType.HIDDEN),
          _.times(3, () => AuctionType.OPEN),
          _.times(3, () => AuctionType.ONE_OFFER)
        ),
        green: _.concat(
          _.times(3, () => AuctionType.DOUBLE),
          _.times(3, () => AuctionType.FIXED),
          _.times(3, () => AuctionType.HIDDEN),
          _.times(3, () => AuctionType.OPEN),
          _.times(3, () => AuctionType.ONE_OFFER)
        ),
        orange: _.concat(
          _.times(3, () => AuctionType.DOUBLE),
          _.times(3, () => AuctionType.FIXED),
          _.times(3, () => AuctionType.HIDDEN),
          _.times(4, () => AuctionType.OPEN),
          _.times(3, () => AuctionType.ONE_OFFER)
        ),
      };

      const numPlayers = _.size(state.players);
      const cardsToDeal = CARDS_TO_DEAL[numPlayers]?.[state.roundIndex] ?? 0;

      const ALL_CARDS = _.flatMap(colors, (color) =>
        _.map(CARDS_TYPES_PER_COLOR[color], (auctionType, idx) => ({
          color,
          paintingIndex: idx,
          auctionType,
        }))
      );
      let deck = [...ALL_CARDS];
      for (let i = 0; i < deck.length; i += 1) {
        const j = Math.floor(prng() * (i + 1));
        const tmp = deck[j];
        deck[j] = deck[i];
        deck[i] = tmp;
      }
      const deal = () => {
        const res = deck[0];
        deck = deck.slice(1);
        return res;
      };

      return {
        ...state,
        deck,
        players: _.mapValues(state.players, (u) => ({
          ...u,
          cards: [...u.cards, ..._.times(cardsToDeal, deal)],
        })),
        roundStarted: true,
        log: [
          ...state.log,
          {
            hhmm,
            text: `Started round ${
              state.roundIndex + 1
            }, dealing ${cardsToDeal} cards to ${numPlayers} players`,
          },
        ],
      };
    }
  }

  if (event.type === 'start_auction') {
    const idx = event.params.idx;
    const card = player.cards[idx];
    console.log('start auction', card);
    const color = player.cards[idx].color;

    // If fifth painting of this color, do not auction and end round
    const count = _.filter(state.rounds[state.roundIndex].auctions, (x) => x.painting.color === color).length;
    if (count === 4) {
      // todo: give priority to lowest color
      const auctions = state.rounds[state.roundIndex].auctions; // color: [painting]
      const colorFreq = _.groupBy(auctions, (x) => x.painting.color);
      const sortedColorFreq = _.sortBy(_.keys(colorFreq), (x) => -colorFreq[x].length);

      const firstColor = sortedColorFreq[0];
      const secondColor = sortedColorFreq[1];
      const thirdColor = sortedColorFreq[2];

      // score player's holdings
      const currentRound = state.rounds[state.roundIndex];
      console.log(`currentRound: ${JSON.stringify(currentRound)}`);
      const playersRound = currentRound.players;
      console.log(`playersRound: ${JSON.stringify(playersRound)}`);
      const playerToScore: {[playerId: string]: number} = {};
      for (const playerId of _.keys(playersRound)) {
        let score = 0;
        console.log(`playerId: ${JSON.stringify(playerId)}`);
        console.log(`playersRound[playerId]: ${playersRound[playerId]}`);
        const playerAcquiredArt = playersRound[playerId].acquiredArt;
        // eslint-disable-next-line guard-for-in
        for (const idx in playerAcquiredArt) {
          const color = playerAcquiredArt[idx].color;
          if (color === firstColor) {
            score += 30;
          } else if (color === secondColor) {
            score += 20;
          } else if (color === thirdColor) {
            score += 10;
          }
        }
        playerToScore[playerId] = score;
      }

      const places = {
        ..._.zipObject(colors, _.times(colors.length, _.constant(0))),
        [firstColor]: 30,
        [secondColor]: 20,
        [thirdColor]: 10,
      };

      return {
        ...state,
        currentAuction: state.currentAuction
          ? {
              ...state.currentAuction,
              status: AuctionStatus.CLOSED,
            }
          : undefined,
        players: _.mapValues(state.players, (player) => {
          if (player.id === playerId) {
            return {
              ...player,
              money: player.money + playerToScore[player.id],
              // remove card
              cards: [...player.cards.slice(0, idx), ...player.cards.slice(idx + 1)],
            };
          } else {
            return {
              ...player,
              money: player.money + playerToScore[player.id],
            };
          }
        }),
        roundIndex: state.roundIndex + 1,
        roundStarted: false,
        rounds: {
          ...state.rounds,
          [state.roundIndex]: {
            ...state.rounds[state.roundIndex].auctions,
            players: _.map(state.players, (player) => ({
              [player.id]: {
                ...state.rounds[state.roundIndex].players[player.id],
                score: playerToScore[player.id],
              },
            })),
            places,
          },
          // new round
          [state.roundIndex + 1]: {
            auctions: [],
            players: _.fromPairs(_.values(state.players).map((u) => [u.id, []])),
          },
        },
        log: [
          ...state.log,
          {
            hhmm,
            text: `${player.name} plays ${card.auctionType} ${card.color} and ends round ${state.roundIndex}`,
          },
        ],
      };
    }

    // round did not end
    else {
      const nPlayers = {
        ...state.players,
        [playerId]: {
          ...player,
          // remove card
          cards: [...player.cards.slice(0, idx), ...player.cards.slice(idx + 1)],
        },
      };

      // If the card was a double, don't start an auction
      if (card.auctionType === AuctionType.DOUBLE) {
        return {
          ...state,
          currentDouble: {
            card,
            activePlayer: playerId,
          },
          players: nPlayers,
          log: [
            ...state.log,
            {
              hhmm,
              text: `${player.name} plays ${card.auctionType} ${card.color}`,
            },
          ],
        };
      }

      const auction: Auction = {
        status: AuctionStatus.PENDING,
        auctioneer: playerId,
        painting: card,
        highestBid: 0,
        activeBidder: nextPlayerId(state, playerId),
      };
      if (state.currentDouble) {
        auction.double = state.currentDouble.card;
      }

      return {
        ...state,
        currentAuction: auction,
        players: nPlayers,
        currentDouble: undefined,
        rounds: {
          ...state.rounds,
          [state.roundIndex]: {
            ...state.rounds[state.roundIndex],
            auctions: [...state.rounds[state.roundIndex].auctions, auction],
          },
        },
        log: [
          ...state.log,
          {
            hhmm,
            text: `${player.name} plays ${card.auctionType} ${card.color}`,
          },
        ],
      };
    }
  }

  if (event.type === 'skip_bid') {
    if (!state.currentAuction || !state.currentAuction.activeBidder) return undefined;

    return {
      ...state,
      currentAuction: {
        ...state.currentAuction,
        activeBidder: nextPlayerId(state, state.currentAuction.activeBidder),
      },
    };
  }
  return state;
};

/**
 * A helper function that contains meat of reducer code.
 *
 * Returns undefined for invalid events
 */
export const modernArtValidatorHelper = (state: ModernArtState, event: ModernArtEvent): boolean => {
  const playerId = event.params.playerId ?? event.params.id;
  const player = state.players[event.params.playerId];

  if (event.type === 'start_game') {
    return !state.started;
  }
  if (event.type === 'submit_bid') {
    console.log('validating submit bid');
    if (!state.currentAuction) return false;
    if (state.currentAuction.status === AuctionStatus.CLOSED) {
      console.log('cannot submit_bid because auction is closed');
      return false;
    }
    const money = state.players[playerId].money;
    if (money < event.params.bidAmount) {
      console.log(`cannot submit_bid because player has insufficient funds ${money}`);
      return false;
    }
    // If it's a turn based auction, only the active bidder can bid
    console.log(
      `auction of type ${state.currentAuction.painting.auctionType} is turn based?`,
      turnBasedAuctions.includes(state.currentAuction.painting.auctionType)
    );
    if (
      turnBasedAuctions.includes(state.currentAuction.painting.auctionType) &&
      state.currentAuction.activeBidder !== playerId
    ) {
      console.log('out of turn');
      return false;
    }

    return true;
  }
  if (event.type === 'finish_auction') {
    if (!state.currentAuction) return false;
    if (state.currentAuction.status === AuctionStatus.CLOSED) {
      console.log('cannot finish_auction because auction is closed');
      return false;
    }
    if (state.currentAuction.auctioneer !== playerId) {
      console.log('only auctioneer can finish_auction');
      return false;
    }
    return true;
  }
  if (event.type === 'update_name') {
    return !state.started;
  }
  if (event.type === 'start_auction') {
    if (!state.currentAuction) return true;
    if (state.currentAuction.status === AuctionStatus.PENDING) {
      console.log('cannot start_auction because there is a pending auction', state);
      return false;
    }
    const currentPlayer = _.keys(state.players)[state.playerIdx];
    if (currentPlayer !== playerId) {
      console.log(`cannot start_auction because ${playerId} is not the current player ${currentPlayer}`);
      // return false; // ignore this rule in dev
    }
    return true;
  }
  return true;
};

export const modernArtReducer = (state: ModernArtState, event: ModernArtEvent): ModernArtState => {
  try {
    if (!modernArtValidatorHelper(state, event)) {
      console.warn('skipping failed validation event', state, event);
      return state;
    }
    const result = modernArtReducerHelper(state, event);
    if (!result) {
      console.warn('skipping invalid event', state, event);
      return state;
    }
    return result;
  } catch (e) {
    console.warn('failed to reduce', state, event);
    console.error(e);
    return state;
  }
};
