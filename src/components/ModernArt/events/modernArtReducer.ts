import _ from 'lodash';
// @ts-ignore
import pseudoRandom from 'pseudo-random';
import {useRafState} from 'react-use';
import {ModernArtState, ModernArtEvent, AuctionType, AuctionStatus} from './types';

/**
 * A helper function.
 *
 * Returns undefined for invalid events
 */
export const _modernArtReducer = (
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
    if (!state.currentAuction) return;
    // give winner the painting, store in new rounds field
    const auctioneer = state.currentAuction.auctioneer;
    const winner = state.currentAuction.highestBidder;
    if (!auctioneer || !winner) return;
    const payment = state.currentAuction.highestBid || state.currentAuction.fixedPrice || -1;
    const closedAuction = {
      ...state.currentAuction,
      status: AuctionStatus.CLOSED,
      winner: winner,
      payment: payment,
    };

    // need to handle case where winner = auctioneer
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
      const prng = pseudoRandom(event.params.seed ?? 1);
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
      // for (let i = 0; i < deck.length; i += 1) {
      //   const j = Math.floor(prng.random() * (i + 1));
      //   console.log(i, j);
      //   const tmp = deck[j];
      //   deck[j] = deck[i];
      //   deck[i] = tmp;
      // }
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
    return {
      ...state,
      users: {
        ...state.users,
        [event.params.userId]: {
          ...state.users[event.params.userId],
        },
      },
    };
    // pass
  }
  return state;
};

export const modernArtReducer = (state: ModernArtState, event: ModernArtEvent): ModernArtState => {
  try {
    return _modernArtReducer(state, event) || state;
  } catch (e) {
    console.error('failed to reduce', state, event);
    return state;
  }
};
