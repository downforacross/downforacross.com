export interface ModernArtEvent {
  type: 'start_game' | 'update_name' | 'step' | 'start_auction';
  params: any;
}

interface Card {
  color: string;
  auctionType: string;
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
}

export const initialState: ModernArtState = {
  started: false,
  users: {},
  deck: [],
  roundIndex: 0,
  roundStarted: false,
};
