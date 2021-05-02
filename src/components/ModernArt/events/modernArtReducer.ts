// @ts-ignore
import seedrandom from 'seedrandom';
import moment from 'moment';
import _, {identity} from 'lodash';
import {
  ModernArtState,
  ModernArtEvent,
  AuctionStatus,
  colors,
  AuctionType,
  turnBasedAuctions,
  ModernArtPlayer,
  Auction,
  LogMessage,
  Card,
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

const finishAuction = (state: ModernArtState, finishedAt: number, logMessage?: LogMessage) => {
  let paintings: Card[] = [];
  let auctioneer = '';
  let winner = '';
  let payment = 0;

  if (!state.currentAuction) {
    // handle when there is one double, but no second painting
    if (state.currentDouble) {
      auctioneer = state.currentDouble.auctioneer;
      winner = auctioneer;
      paintings = [state.currentDouble.card];
    } else {
      return undefined;
    }
  } else {
    auctioneer = state.currentAuction.auctioneer;
    paintings = [state.currentAuction.painting];

    if (state.currentAuction.painting.auctionType === AuctionType.HIDDEN) {
      if (!state.currentAuction.hiddenBids) return undefined;
      winner = auctioneer;
      payment = 0;
      // give preference to first player after auctioneer
      let firstPlayer = nextPlayerId(state, auctioneer);
      console.log('firstPlayer is ', firstPlayer);
      let seenPlayers: string[] = [];
      for (let id = firstPlayer; !seenPlayers.includes(id); id = nextPlayerId(state, id)) {
        seenPlayers.push(id);
        console.log('evaluating id ', id, state.currentAuction.hiddenBids);
        if (id in state.currentAuction.hiddenBids) {
          let bid = state.currentAuction.hiddenBids[id];
          if (bid > payment) {
            winner = id;
            payment = bid;
          }
        }
      }
    } else {
      // If no highestBidder, then painting goes to auctioneer
      winner = state.currentAuction.highestBidder || auctioneer;
      if (!auctioneer || !winner) return undefined;
      payment = state.currentAuction.highestBid || state.currentAuction.fixedPrice || 0;
      state.currentAuction.double && paintings.push(state.currentAuction.double);
    }
  }

  const hhmm = moment(finishedAt).format('hh:mm');

  return {
    ...state,
    playerIdx: (state.playerIdx + 1) % _.keys(state.players).length,
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
              ...paintings,
            ],
          },
        },
      },
    },
    log: _.compact([
      ...state.log,
      logMessage,
      {
        hhmm,
        text: `${state.players[winner].name} won the auction for ${payment} and acquired ${
          paintings.length === 1
            ? '1 ' + paintings[0].color
            : paintings.length + ' ' + paintings[0].color + 's'
        }`,
      },
    ]),
    currentAuction: state.currentAuction
      ? {
          ...state.currentAuction,
          status: AuctionStatus.CLOSED,
          winner,
          payment,
          double: undefined,
        }
      : state.currentAuction,
    currentDouble: undefined,
  };
};

const submitBid = (state: ModernArtState, finishedAt: number, player: ModernArtPlayer, bidAmount: number) => {
  if (!state.currentAuction) return undefined;
  const hhmm = moment(finishedAt).format('hh:mm');

  let stateAfterBid;
  if (state.currentAuction.painting.auctionType === AuctionType.HIDDEN) {
    stateAfterBid = {
      ...state,
      currentAuction: {
        ...state.currentAuction,
        hiddenBids: {
          ...state.currentAuction.hiddenBids,
          [player.id]: bidAmount,
        },
      },
      log: [
        ...state.log,
        {
          hhmm,
          text: `${player.name} has submitted a bid`,
        },
      ],
    };
  } else {
    stateAfterBid = {
      ...state,
      currentAuction: {
        ...state.currentAuction,
        highestBidder: player.id,
        highestBid: bidAmount,
        activeBidder:
          state.currentAuction.activeBidder && nextPlayerId(state, state.currentAuction.activeBidder),
      },
      log: [
        ...state.log,
        {
          hhmm,
          text: `${player.name} has submitted a bid for ${bidAmount}`,
        },
      ],
    };
  }

  if (state.currentAuction.painting.auctionType === AuctionType.FIXED) {
    return finishAuction(stateAfterBid, finishedAt);
  }
  if (
    turnBasedAuctions.includes(state.currentAuction.painting.auctionType) &&
    state.currentAuction.auctioneer === player.id
  ) {
    return finishAuction(stateAfterBid, finishedAt);
  }

  if (
    state.currentAuction.painting.auctionType === AuctionType.HIDDEN &&
    _.keys(stateAfterBid.currentAuction.hiddenBids).length === _.keys(state.players).length
  ) {
    return finishAuction(stateAfterBid, finishedAt);
  }

  return stateAfterBid;
};

const skipBid = (state: ModernArtState, finishedAt: number, player: ModernArtPlayer) => {
  if (!state.currentAuction || !state.currentAuction.activeBidder) return undefined;
  const hhmm = moment(finishedAt).format('hh:mm');
  const logMessage = {
    hhmm,
    text: `${player.name} elected to skip`,
  };

  if (
    state.currentAuction.painting.auctionType === AuctionType.FIXED &&
    nextPlayerId(state, state.currentAuction.activeBidder) === state.currentAuction.auctioneer
  ) {
    return finishAuction(state, finishedAt, logMessage);
  }

  if (
    state.currentAuction.painting.auctionType === AuctionType.ONE_OFFER &&
    state.currentAuction.activeBidder === state.currentAuction.auctioneer
  ) {
    return finishAuction(state, finishedAt, logMessage);
  }

  return {
    ...state,
    currentAuction: {
      ...state.currentAuction,
      activeBidder: nextPlayerId(state, state.currentAuction.activeBidder),
    },
    log: [...state.log, logMessage],
  };
};

const finishRound = (
  state: ModernArtState,
  finishedAt: number,
  playerId: string,
  card: Card,
  cardIdx: number
) => {
  const hhmm = moment(finishedAt).format('hh:mm');

  const auctions = state.rounds[state.roundIndex].auctions;
  const colorFreq = _.groupBy(auctions, (x) => x.painting.color); // color: [painting]
  console.log(`colorFreq ${JSON.stringify(colorFreq)}`);
  const sortedColorFreq = _.sortBy(colors, (x) => (x in colorFreq ? -colorFreq[x].length : 0));
  console.log(`sortedColorFreq ${JSON.stringify(sortedColorFreq)}`);

  const firstColor = sortedColorFreq[0] in colorFreq ? sortedColorFreq[0] : 'None';
  const secondColor = sortedColorFreq[1] in colorFreq ? sortedColorFreq[1] : 'None'; // for when only one color is played
  const thirdColor = sortedColorFreq[2] in colorFreq ? sortedColorFreq[2] : 'None'; // for when only two colors are played

  // score player's holdings
  // for rounds before current round index, if there's is a value then add to score; otherwise break
  const payouts = {
    [firstColor]: 30,
    [secondColor]: 20,
    [thirdColor]: 10,
  };
  for (let id in _.keys(payouts)) {
    let color = _.keys(payouts)[id];
    for (let round = state.roundIndex - 1; round > -1; round--) {
      let temp = state.rounds[round].places?.[color];
      if (!!temp) {
        payouts[color] += temp;
      } else {
        break;
      }
    }
  }

  const currentRound = state.rounds[state.roundIndex];
  const playersRound = currentRound.players;
  const playerToScore: {[playerId: string]: number} = {};
  for (const playerId of _.keys(playersRound)) {
    let score = 0;
    const playerAcquiredArt = playersRound[playerId].acquiredArt;
    // eslint-disable-next-line guard-for-in
    for (const idx in playerAcquiredArt) {
      const color = playerAcquiredArt[idx].color;
      if (color === firstColor) {
        score += payouts[firstColor];
      } else if (color === secondColor) {
        score += payouts[secondColor];
      } else if (color === thirdColor) {
        score += payouts[thirdColor];
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
    currentDouble: undefined,
    players: _.mapValues(state.players, (player) => {
      if (player.id === playerId) {
        return {
          ...player,
          money: player.money + playerToScore[player.id],
          // remove card
          cards: [...player.cards.slice(0, cardIdx), ...player.cards.slice(cardIdx + 1)],
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
        ...state.rounds[state.roundIndex],
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
        text: `${state.players[playerId].name} plays ${card.auctionType} ${card.color} and ends round ${state.roundIndex}`,
      },
    ],
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
  } else if (event.type === 'submit_fixed_price') {
    if (!state.currentAuction) return undefined;
    return {
      ...state,
      currentAuction: {
        ...state.currentAuction,
        fixedPrice: event.params.fixedPrice,
      },
      log: [
        ...state.log,
        {
          hhmm,
          text: `${player.name} set fixed price to ${event.params.fixedPrice}`,
        },
      ],
    };
  } else if (event.type === 'accept_fixed_price') {
    if (!state.currentAuction) return undefined;
    if (state.currentAuction.fixedPrice === undefined) return undefined;
    return submitBid(state, timestamp, player, state.currentAuction.fixedPrice);
  } else if (event.type === 'submit_bid') {
    if (!state.currentAuction) return undefined;
    // if submitted bid is less than highest bid, process as skip if one_offer
    if (
      [AuctionType.ONE_OFFER, AuctionType.OPEN].includes(state.currentAuction.painting.auctionType) &&
      state.currentAuction.highestBid &&
      event.params.bidAmount <= state.currentAuction.highestBid
    ) {
      if (state.currentAuction.painting.auctionType === AuctionType.ONE_OFFER) {
        return skipBid(state, timestamp, player);
      } else if (state.currentAuction.painting.auctionType === AuctionType.OPEN) {
        return {
          ...state,
          log: [
            ...state.log,
            {
              hhmm,
              text: `${player.name} submitted bid ${event.params.bidAmount}, but highest bid is ${state.currentAuction.highestBid}`,
            },
          ],
        };
      }
    }
    if (
      state.currentAuction.painting.auctionType === AuctionType.HIDDEN &&
      state.currentAuction.hiddenBids &&
      player.id in state.currentAuction.hiddenBids
    ) {
      return {
        ...state,
        log: [
          ...state.log,
          {
            hhmm,
            text: `${player.name} submitted another bid, but only first bid is accepted.`,
          },
        ],
      };
    }
    // same as submitting a bid for that price
    return submitBid(state, timestamp, player, event.params.bidAmount);
  } else if (event.type === 'finish_auction')
    return finishAuction(state, timestamp, {
      hhmm,
      text: `${player.name} finished the auction`,
    });
  else if (event.type === 'update_name') {
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
  } else if (event.type === 'step') {
    // do the next automated step depending on the game state
    if (!state.roundStarted) {
      let deck: Card[];
      if (state.deck.length === 0) {
        const prng = seedrandom(event.params.seed ?? 1);

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

        const ALL_CARDS = _.flatMap(colors, (color) =>
          _.map(CARDS_TYPES_PER_COLOR[color], (auctionType, idx) => ({
            color,
            paintingIndex: idx,
            auctionType,
          }))
        );
        deck = [...ALL_CARDS];
        for (let i = 0; i < deck.length; i += 1) {
          const j = Math.floor(prng() * (i + 1));
          const tmp = deck[j];
          deck[j] = deck[i];
          deck[i] = tmp;
        }
      } else {
        deck = state.deck;
      }

      const CARDS_TO_DEAL: Record<string, number[]> = {
        1: [10, 10, 10],
        2: [10, 10, 10],
        3: [10, 6, 6],
        4: [9, 4, 4],
        5: [8, 3, 3],
      };
      const numPlayers = _.size(state.players);
      const cardsToDeal = CARDS_TO_DEAL[numPlayers]?.[state.roundIndex] ?? 0;

      const deal = () => {
        const res = deck[0];
        deck = deck.slice(1);
        return res;
      };

      const nPlayers = _.mapValues(state.players, (u) => ({
        ...u,
        cards: [...u.cards, ..._.times(cardsToDeal, deal)],
      }));

      return {
        ...state,
        deck: deck,
        players: nPlayers,
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
  } else if (event.type === 'start_auction') {
    const idx = event.params.idx;
    const card = player.cards[idx];
    const color = player.cards[idx].color;

    // If fifth painting of this color, do not auction and end round
    const count = _.filter(state.rounds[state.roundIndex].auctions, (x) => x.painting.color === color).length;
    // + _.filter(state.rounds[state.roundIndex].auctions, (x) => x.double?.color === color).length
    // + (state.currentDouble ? 1 : 0);

    if (count === 4) {
      return finishRound(state, timestamp, playerId, card, idx);
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
        // kind of a hack. needed when a player plays a DOUBLE, but no player plays another card.
        const placeholderAuction: Auction = {
          status: AuctionStatus.PENDING,
          auctioneer: playerId,
          painting: card,
          highestBid: 0,
          activeBidder: '',
        };

        return {
          ...state,
          currentDouble: {
            card,
            auctioneer: playerId,
            activePlayer: playerId,
          },
          rounds: {
            ...state.rounds,
            [state.roundIndex]: {
              ...state.rounds[state.roundIndex],
              auctions: [...state.rounds[state.roundIndex].auctions, placeholderAuction],
            },
          },
          currentAuction: undefined,
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
  } else if (event.type === 'skip_bid') {
    return skipBid(state, timestamp, player);
  } else if (event.type === 'skip_double') {
    if (!state.currentDouble || !state.currentDouble.activePlayer) return undefined;

    const logMessage = {
      hhmm,
      text: `${player.name} skips playing double`,
    };
    // everyone skipped
    if (nextPlayerId(state, state.currentDouble.activePlayer) === state.currentDouble.auctioneer) {
      return finishAuction(state, timestamp, logMessage);
    }

    return {
      ...state,
      currentDouble: {
        ...state.currentDouble,
        activePlayer: nextPlayerId(state, state.currentDouble.activePlayer),
      },
      log: [...state.log, logMessage],
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
  } else if (event.type === 'submit_fixed_price') {
    if (!state.currentAuction) return false;
    if (state.currentAuction.painting.auctionType !== AuctionType.FIXED) {
      console.log('cannot submit_fixed_price since auction is not fixed price');
      return false;
    }
    if (state.currentAuction.fixedPrice) {
      console.log('cannot submit_fixed_price since auction already has price');
      return false;
    }
    if (playerId !== state.currentAuction.auctioneer) {
      console.log(
        `cannot submit_fixed_price since ${playerId} is not the auctioneer ${state.currentAuction.auctioneer}`
      );
      return false;
    }
    if (event.params.fixedPrice <= 0) {
      console.log(`cannot submit_fixed_price since ${event.params.fixedPrice} <= 0`);
      return false;
    }
    return true;
  } else if (event.type === 'accept_fixed_price') {
    if (!state.currentAuction) return false;
    if (state.currentAuction.status === AuctionStatus.CLOSED) {
      console.log('cannot accept_fixed_price because auction is closed');
      return false;
    }
    const money = state.players[playerId].money;
    if (money < event.params.bidAmount) {
      console.log(`cannot accept_fixed_price because player has insufficient funds ${money}`);
      return false;
    }
  } else if (event.type === 'submit_bid') {
    if (!state.currentAuction) return false;
    if (state.currentAuction.status === AuctionStatus.CLOSED) {
      console.log('cannot submit_bid because auction is closed');
      return false;
    }
    if (event.params.bidAmount <= 0) {
      console.log(`cannot submit_bid since ${event.params.bidAmount} <= 0`);
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
    const currentPlayer = _.keys(state.players)[state.playerIdx];

    if (state.currentAuction?.status === AuctionStatus.PENDING) {
      console.log('cannot start_auction because there is a pending auction', state);
      return false;
    }

    // double auction rules
    if (state.currentDouble) {
      const idx = event.params.idx;
      const card = player.cards[idx];

      console.log('validating start_auction, state is ', state, state.currentDouble.card.color, card.color);
      if (state.currentDouble.card.color !== card.color) {
        console.log(
          `second card (${card.color}) must be same color as double (${state.currentDouble.card.color})`
        );
        return false;
      }
      if (card.auctionType === AuctionType.DOUBLE) {
        console.log(`second card (${card.auctionType}) cannot be another double`);
        return false;
      }

      if (playerId !== state.currentDouble.activePlayer) {
        console.log(
          `second card cannot be played by ${playerId} (it is ${state.currentDouble.activePlayer}'s turn)`,
          state
        );
        return false;
      }
    } else if (currentPlayer !== playerId) {
      console.log(`cannot start_auction because ${playerId} is not the current player ${currentPlayer}`);
      return false;
    }
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
