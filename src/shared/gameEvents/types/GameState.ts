import {GameJson} from '../../types';

export interface GameState {
  loaded: boolean;
  game: null | GameJson;
  users: {
    [id: string]: {
      displayName: string;
      teamId?: number;
      score?: number;
    };
  };
}
