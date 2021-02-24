export interface ModernArtEvent {
  type: 'start_game' | 'update_name' | 'step' | 'start_auction';
  params: any;
}

interface Card {
  color: string;
  auctionType: string;
}

export enum AuctionType {
  // OPEN = 'OPEN',
  HIDDEN = 'HIDDEN',
  // ONE_OFFER = 'ONE_OFFER',
  // FIXED = 'FIXED',
  // DOUBLE = 'DOUBLE',
}

export interface Painting {
  painter: string;
  id: number;
}
export interface Auction {
  auctionType: AuctionType;
  auctioneer: string;
  painting: Painting;
  // secondPainting?: Painting;
  // fixedPrice?: number;
  highestBid?: number | null;
  highestBidder?: string | null;
}
export interface ModernArtState {
  started: boolean;
  deck: Card[];
  users: {
    [id: string]: {
      name: string;
      icon: string;
      cards: Card[];
    };
  };
  roundIndex: number;
  roundStarted: boolean;
  currentAuction: Auction;
}

export const initialState: ModernArtState = {
  started: false,
  users: {},
  deck: [],
  roundIndex: 0,
  roundStarted: false,
  currentAuction: {
    auctionType: AuctionType.HIDDEN,
    auctioneer: 'cat',
    painting: {
      painter: 'sigrid',
      id: 1,
    },
    highestBid: null,
    highestBidder: null,
  },
};
