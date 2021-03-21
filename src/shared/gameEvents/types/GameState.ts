import {GameJson, UserJson} from '../../types';

export interface GameState {
  loaded: boolean;
  game: null | GameJson;
  users: {
    [id: string]: UserJson;
  };
  teams: Partial<
    Record<
      string,
      {
        color: string;
        score: number;
        guesses: number;
        name: string;
      }
    >
  >;
}
