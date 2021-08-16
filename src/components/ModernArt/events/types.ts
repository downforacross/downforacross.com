export interface ModernArtEvent {
  type:
    | 'start_game'
    | 'update_name'
    | 'step'
    | 'start_auction'
    | 'submit_fixed_price'
    | 'accept_fixed_price'
    | 'submit_bid'
    | 'finish_auction'
    | 'skip_bid'
    | 'skip_double';
  params: any; // oh no
  timestamp?: number | object;
}

export interface Card {
  color: string;
  paintingIndex: number; // which painting of the artist to display
  auctionType: AuctionType;
}

export enum AuctionType {
  OPEN = 'OPEN',
  HIDDEN = 'HIDDEN', // to do: 1) show viewer their own bids 2) after auction ends, show selling price
  ONE_OFFER = 'ONE_OFFER',
  FIXED = 'FIXED', // todo: 1) allow player to fix the price 2) active bidder turns
  DOUBLE = 'DOUBLE', // todo: 1) in "Cards to Auction", add UI to select two cards 2) in "Current Auction", display the two cards
}

export const turnBasedAuctions = [AuctionType.ONE_OFFER, AuctionType.FIXED];

export enum AuctionStatus {
  PENDING = 'PENDING',
  CLOSED = 'CLOSED',
}

export const colors = ['yellow', 'blue', 'red', 'green', 'orange'];

export const rgbColors: {[key: string]: string} = {
  red: '#DC2626',
  green: '#059669',
  orange: '#FD6A02',
  blue: '#2563EB',
  yellow: '#FCD34D', // should be darker (?)
};

export const painters: {[key: string]: string} = {
  yellow: 'Kadinsky',
  blue: 'Degas',
  red: 'Monet',
  green: 'VanEyk',
  orange: 'Picasso',
};
export interface Auction {
  status: AuctionStatus;
  auctioneer: string;
  painting: Card; // auctionType is on Card
  double?: Card; // DOUBLE
  fixedPrice?: number; // FIXED
  highestBid?: number | null; // ONE_OFFER, OPEN
  hiddenBids?: {[id: string]: number}; // HIDDEN
  highestBidder?: string | null; // ONE_OFFER, HIDDEN, OPEN
  activeBidder?: string | null; // ONE_OFFER, FIXED
  winner?: string | null; // derived field to standardize across auction types
  payment?: number | null; // derived field to standardize across auction types
}

export interface Round {
  auctions: Auction[];
  players: {
    [id: string]: {
      acquiredArt: Card[];
      score?: number;
    };
  };
  places?: {[color: string]: number};
}

export interface LogMessage {
  text: string;
  hhmm: string;
}

export interface ModernArtPlayer {
  id: string;
  name: string;
  iconIdx: number;
  cards: Card[];
  money: number;
}

export interface ModernArtState {
  started: boolean;
  deck: Card[];
  playerIdx: number;
  players: {
    [id: string]: ModernArtPlayer;
  };
  roundIndex: number;
  roundStarted: boolean;
  rounds: {
    [id: string]: Round;
  };
  currentAuction?: Auction;
  currentDouble?: {
    card: Card;
    auctioneer: string;
    activePlayer: string;
  };
  log: LogMessage[];
}

export const initialState: ModernArtState = {
  started: false,
  playerIdx: 0,
  players: {},
  deck: [],
  roundIndex: 0,
  roundStarted: false,
  rounds: {
    '0': {
      auctions: [],
      players: {},
    },
  },
  log: [
    {
      hhmm: '--:--',
      text: 'Welcome to modern art!',
    },
  ],
};
