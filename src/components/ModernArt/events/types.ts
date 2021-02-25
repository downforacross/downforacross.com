export interface ModernArtEvent {
  type: 'start_game' | 'update_name' | 'step' | 'start_auction' | 'submit_bid' | 'finish_auction';
  params: any;
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

export interface Painting {
  painter: string;
  id: number;
}

export enum AuctionStatus {
  PENDING = 'PENDING',
  CLOSED = 'CLOSED',
}
export interface Auction {
  status: AuctionStatus;
  auctionType: AuctionType;
  auctioneer: string;
  painting: Painting;
  secondPainting?: Painting; // DOUBLE
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
      acquiredArt: Painting[];
    };
  };
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
  currentAuction: Auction;
}

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
  rounds: {},
  currentAuction: {
    status: AuctionStatus.PENDING,
    auctionType: AuctionType.OPEN,
    auctioneer: 'cat',
    painting: {
      painter: 'sigrid',
      id: 1,
    },
    highestBid: null,
    highestBidder: null,
  },
};
