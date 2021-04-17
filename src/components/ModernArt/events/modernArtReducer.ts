// @ts-ignore
import seedrandom from 'seedrandom';
import moment from 'moment';
import _ from 'lodash';
import {ModernArtState, ModernArtEvent, AuctionStatus, colors, AuctionType} from './types';

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
    return {
      ...state,
      currentAuction: {
        ...state.currentAuction,
        highestBidder: event.params.playerId,
        highestBid: event.params.bidAmount,
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
    // }
  }
  if (event.type === 'finish_auction') {
    if (!state.currentAuction) return undefined;
    const auctioneer = state.currentAuction.auctioneer;

    // If no highestBidder, then painting goes to auctioneer
    const winner = state.currentAuction.highestBidder || auctioneer;
    if (!auctioneer || !winner) return undefined;
    const payment = state.currentAuction.highestBid || state.currentAuction.fixedPrice || 0;
    const closedAuction = {
      ...state.currentAuction,
      status: AuctionStatus.CLOSED,
      winner,
      payment,
    };

    if (state.players[winner].money < payment) return undefined;

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
              acquiredArt: [
                ...(state.rounds[state.roundIndex]?.players[winner]?.acquiredArt ?? []),
                closedAuction.painting,
              ],
            },
          },
        },
      },
      log: _.compact([
        ...state.log,
        player && {
          hhmm,
          text: `${player.name} finished the auction`,
        },
        {
          hhmm,
          text: `${state.players[winner].name} won the auction for ${payment} and acquired a ${closedAuction.painting.color}`,
        },
      ]),
      currentAuction: closedAuction,
    };
  }
  if (event.type === 'update_name') {
    if (!player && state.started) {
      return undefined;
    }
    return {
      ...state,
      players: {
        ...state.players,
        [event.params.id]: {
          // @ts-ignore
          cards: [],
          ...state.players[event.params.id],
          name: event.params.name,
          icon: event.params.icon,
          id: event.params.id,
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
        // TODO
        1: [10, 10, 10],
        2: [10, 10, 10],
        3: [10, 10, 10],
        4: [10, 5, 3],
      };
      const numPlayers = _.size(state.players);
      const cardsToDeal = CARDS_TO_DEAL[numPlayers]?.[state.roundIndex] ?? 0;
      const auctionTypes = [AuctionType.HIDDEN, AuctionType.OPEN, AuctionType.ONE_OFFER];

      const ALL_CARDS = _.flatMap(colors, (color) =>
        auctionTypes.map((auctionType) => ({
          color,
          auctionType,
        }))
      );
      let deck = [...ALL_CARDS, ...ALL_CARDS, ...ALL_CARDS, ...ALL_CARDS];
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
    const nPlayers = {
      ...state.players,
      [playerId]: {
        ...player,
        // remove card
        cards: [...player.cards.slice(0, idx), ...player.cards.slice(idx + 1)],
      },
    };

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
        players: nPlayers,
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
    const auction = {
      status: AuctionStatus.PENDING,
      auctioneer: playerId,
      painting: card,
      highestBid: 0,
    };
    return {
      ...state,
      currentAuction: auction,
      players: nPlayers,
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
    // pass
  }

  if (event.type === 'skip_bid') {
    if (!state.currentAuction || !state.currentAuction.activeBidder) return undefined;

    return {
      ...state,
      currentAuction: {
        ...state.currentAuction,
        activeBidder: (state.currentAuction.activeBidder + 1) % _.keys(state.players).length,
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
    // if auction type is one_offer but you are not the active bidder, you're rejected
    if (state.currentAuction.painting.auctionType === AuctionType.ONE_OFFER) {
      if (state.currentAuction.activeBidder !== playerId) {
        console.log(
          `cannot submit_bid because ${playerId} is not the active bidder ${state.currentAuction.activeBidder}`
        );
        return false;
      }
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
    return true;
  }
  if (event.type === 'start_auction') {
    if (!state.currentAuction) return true;
    if (state.currentAuction.status === AuctionStatus.PENDING) {
      console.log('cannot start_auction because there is a pending auction');
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
