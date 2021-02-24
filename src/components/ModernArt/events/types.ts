export interface ModernArtEvent {
  type: 'start_game' | 'update_name';
  params: any;
}

export interface ModernArtState {
  started: boolean;
  users: {
    [id: string]: {
      name: string;
    };
  };
}

export const initialState: ModernArtState = {
  started: false,
  users: {},
};
