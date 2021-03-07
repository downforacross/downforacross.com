export interface ModernArtEvent {
  type: 'start_game' | 'update_name' | 'step' | 'start_auction' | 'submit_bid' | 'finish_auction';
  params: any;
  timestamp?: number | object;
}

interface Card {
  color: string;
  auctionType: string;
}

export enum AuctionType {
  OPEN = 'OPEN',
  HIDDEN = 'HIDDEN',
  ONE_OFFER = 'ONE_OFFER',
  FIXED = 'FIXED',
  DOUBLE = 'DOUBLE',
}

export enum AuctionStatus {
  PENDING = 'PENDING',
  CLOSED = 'CLOSED',
}
export interface Auction {
  status: AuctionStatus;
  auctioneer: string;
  painting: Card; // auctionType is on Card
  secondPainting?: Card; // DOUBLE
  fixedPrice?: number; // FIXED
  highestBid?: number | null; // ONE_OFFER, HIDDEN, OPEN
  highestBidder?: string | null; // ONE_OFFER, HIDDEN, OPEN
  latestBidder?: number | null; // ONE_OFFER, FIXED
  winner?: string | null; // derived field to standardize across auction types
  payment?: number | null; // derived field to standardize across auction types
}

export interface Round {
  auctions: Auction[];
  users: {
    // might delete this
    [id: string]: {
      acquiredArt: Card[];
    };
  };
}

export interface LogMessage {
  text: string;
  timestamp: number;
}
export interface ModernArtState {
  started: boolean;
  deck: Card[];
  users: {
    [id: string]: {
      id: string;
      name: string;
      icon: string;
      cards: Card[];
      money: number;
    };
  };
  roundIndex: number;
  roundStarted: boolean;
  rounds: {
    [id: string]: Round;
  };
  currentAuction?: Auction;
  log: LogMessage[];
}

const firstAuction: Auction = {
  status: AuctionStatus.PENDING,
  auctioneer: 'cat',
  painting: {
    color: 'blue',
    auctionType: AuctionType.OPEN,
  },
  highestBid: null,
  highestBidder: null,
};

export const initialState: ModernArtState = {
  started: false,
  users: {
    cat: {
      id: 'cat',
      name: 'catcat',
      icon: '',
      cards: [],
      money: 100,
    },
  },
  deck: [],
  roundIndex: 0,
  roundStarted: false,
  rounds: {
    '0': {
      auctions: [firstAuction],
      users: {},
    },
  },
  currentAuction: firstAuction,
  log: [
    {
      timestamp: 0,
      text: 'Welcome to modern art!',
    },
  ],
};
