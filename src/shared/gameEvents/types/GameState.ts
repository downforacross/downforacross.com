import {GameJson, UserJson} from '../../types';

export interface GameState {
  loaded: boolean;
  started: boolean;
  startedAt: number | null;
  game: null | GameJson;
  users: {
    [id: string]: UserJson;
  };
  teams: Partial<
    Record<
      string,
      {
        id: number;
        color: string;
        score: number;
        guesses: number;
        name: string;
        lockedUntil: number;
      }
    >
  >;
  chat: {
    messages: {
      text: string;
      senderId: string;
      timestamp: number | undefined;
    }[];
  };
}
