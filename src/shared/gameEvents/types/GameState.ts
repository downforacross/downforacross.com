import {CellCoords, GameJson} from '../../types';

export interface GameState {
  loaded: boolean;
  game: null | GameJson;
  users: {
    [id: string]: {
      cursor?: CellCoords;
      displayName: string;
      teamId?: number;
      score?: number;
    };
  };
}
