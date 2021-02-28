import {GameJson} from '../../types';

export interface GameState {
  loaded: boolean;
  game: null | GameJson;
  users: {
    [id: string]:
      | {
          displayName: string;
          teamId?: string;
        }
      | undefined;
  };
}
