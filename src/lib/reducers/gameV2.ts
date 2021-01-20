import {GameEvent, GameEventParams, GameEventType, isUserPingGameEvent} from '../../shared/gameEvents';
import _ from 'lodash';

export interface GameState {
  users: {
    uid: string;
    lastPing: number;
  }[];
  games: {
    gid: string;
  }[];
}

interface GameReducerFn<T extends GameEventType = GameEventType> {
  (game: GameState, params: GameEventParams[T], timestamp: number): GameState;
}

const userPingReducer: GameReducerFn<GameEventType.USER_PING> = (game, params, timestamp) => {
  const nUsers = [
    {
      uid: params.uid,
      lastPing: timestamp,
    },
    ...game.users.filter((user) => user.uid !== params.uid),
  ];
  return {
    ...game,
    users: nUsers,
  };
};

export const initialGameState: GameState = {
  users: [],
  games: [],
};
export const gameReducer = (game: GameState, event: GameEvent, options = {}): GameState => {
  try {
    if (isUserPingGameEvent(event)) {
      return userPingReducer(game, event.params, event.timestamp);
    } else {
      // @ts-ignore
      console.error('event', event.type, 'not found');
      return game;
    }
  } catch (e) {
    console.error('Error handling event', event);
    return game;
  }
};
