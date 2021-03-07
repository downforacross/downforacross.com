import _ from 'lodash';
import {ModernArtState, ModernArtEvent, AuctionStatus} from './types';
// @ts-ignore
import seedrandom from 'seedrandom';
import state from 'sweetalert/typings/modules/state';

/**
 * A helper function that contains meat of reducer code.
 *
 * Returns undefined for invalid events
 */
export const modernArtReducerHelper = (
  state: ModernArtState,
  event: ModernArtEvent
): ModernArtState | undefined => {
  if (event.type === 'start_game') {
    return {
      ...state,
      started: true,
      users: _.mapValues(state.users, (user) => ({
        ...user,
        money: 100,
      })),
      rounds: {
        '0': {
          auctions: [],
          users: _.mapValues(state.users, (user) => ({
            id: user.id,
            acquiredArt: [],
          })),
        },
      },
    };
  }
  if (event.type === 'submit_bid') {
    if (event.params.bidAmount > state.currentAuction.highestBid!) {
      return {
        ...state,
        currentAuction: {
          ...state.currentAuction,
          highestBidder: event.params.userId,
          highestBid: event.params.bidAmount,
        },
      };
    }
  }
  if (event.type === 'finish_auction') {
    if (!state.currentAuction) return undefined;
    // give winner the painting, store in new rounds field
    const auctioneer = state.currentAuction.auctioneer;
    const winner = state.currentAuction.highestBidder;
    if (!auctioneer || !winner) return undefined;
    const payment = state.currentAuction.highestBid || state.currentAuction.fixedPrice || -1;
    const closedAuction = {
      ...state.currentAuction,
      status: AuctionStatus.CLOSED,
      winner,
      payment,
    };

    return {
      ...state,
      users: {
        ...state.users,
        [winner]: {
          ...state.users[winner],
          money: state.users[winner].money - payment,
        },
        [auctioneer]: {
          ...state.users[auctioneer],
          money: state.users[auctioneer].money - payment,
        },
      },
      rounds: {
        ...state.rounds,
        [state.roundIndex]: {
          auctions: [...(state.rounds[state.roundIndex]?.auctions ?? []), closedAuction],
          users: {
            ...state.rounds[state.roundIndex]?.users,
            [winner]: [
              ...(state.rounds[state.roundIndex]?.users[winner]?.acquiredArt ?? []),
              closedAuction.painting,
            ],
          },
        },
      },
      currentAuction: closedAuction,
    };
  }
  if (event.type === 'update_name') {
    return {
      ...state,
      users: {
        ...state.users,
        [event.params.id]: {
          // @ts-ignore
          cards: [],
          ...state.users[event.params.id],
          name: event.params.name,
          icon: event.params.icon,
          id: event.params.id,
        },
      },
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
      const cardsToDeal = CARDS_TO_DEAL[`${_.size(state.users)}`]?.[state.roundIndex] ?? 0;
      const auctionTypes = ['hidden', 'open'];

      const colors = ['red', 'blue', 'yellow', 'green', 'purple'];
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
        users: _.mapValues(state.users, (user) => ({
          ...user,
          cards: [...user.cards, ..._.times(cardsToDeal, deal)],
        })),
        roundStarted: true,
      };
    }
  }

  if (event.type === 'start_auction') {
    const userId = event.params.userId;
    const idx = event.params.idx;
    const card = state.users[userId].cards[idx];
    const color = state.users[userId].cards[idx].color;

    // If fifth painting of this color, do not auction and end round
    const count = _.filter(state.rounds[state.roundIndex].auctions, (x) => x.painting.color === color).length;
    if (count === 5) {
      // todo: give priority to lowest color
      const auctions = state.rounds[state.roundIndex].auctions; // color: [painting]
      const colorFreq = _.groupBy(auctions, (x) => x.painting.color);
      const sortedColorFreq = _.sortBy(_.keys(colorFreq), (x) => -colorFreq[x].length);
      // const sortedColorFreq = _.sortBy(colorFreq, [function(o) { return o.length; }]); // color: freq
      return {
        ...state,
        // remove card
        users: {
          ...state.users,
          [userId]: {
            ...state.users[userId].cards.splice(idx, 1),
          },
        },
        roundIndex: state.roundIndex + 1,
        // new round
        rounds: {
          ...state.rounds,
          [state.roundIndex + 1]: {
            auctions: [],
            users: _.map(state.users, (user) => ({
              [user.id]: [],
            })),
          },
        },
      };
    }

    // round did not end
    const auction = {
      status: AuctionStatus.PENDING,
      auctioneer: userId,
      painting: card,
    };
    return {
      ...state,
      currentAuction: auction,
      users: {
        ...state.users,
        [userId]: {
          ...state.users[userId].cards.splice(idx, 1),
        },
      },
      rounds: {
        ...state.rounds,
        [state.roundIndex]: {
          ...state.rounds[state.roundIndex],
          auctions: state.rounds[state.roundIndex].auctions.concat(auction),
        },
      },
    };
    // pass
  }
  return state;
};

/**
 * A helper function that contains meat of reducer code.
 *
 * Returns undefined for invalid events
 */
export const modernArtValidatorHelper = (state: ModernArtState, event: ModernArtEvent): boolean => {
  if (event.type === 'start_game') {
    return !state.started;
  }
  if (event.type === 'submit_bid') {
    if (state.currentAuction.status === AuctionStatus.CLOSED) {
      return false;
    }
    return true;
  }
  if (event.type === 'finish_auction') {
    if (state.currentAuction.status === AuctionStatus.CLOSED) {
      return false;
    }
    return true;
  }
  if (event.type === 'update_name') {
    return true;
  }
  if (event.type === 'start_auction') {
    if (state.currentAuction.status === AuctionStatus.PENDING) {
      return false;
    }
    return true;
  }
  return true;
};

export const modernArtReducer = (state: ModernArtState, event: ModernArtEvent): ModernArtState => {
  try {
    if (modernArtValidatorHelper(state, event)) {
      return modernArtReducerHelper(state, event) || state;
    } else {
      console.log(`event ${event} is invalid`);
      return state;
    }
  } catch (e) {
    console.error('failed to reduce', state, event);
    return state;
  }
};
