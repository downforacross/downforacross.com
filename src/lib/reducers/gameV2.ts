import {
  GameEvent,
  GameEventParams,
  GameEventType,
  isInitializeGameEvent,
  isUserPingGameEvent,
} from '../../shared/gameEvents';
import _ from 'lodash';
import {CluesJson, InfoJson} from '../../shared/types';
import {GridData} from '../../components/Grid/types';

/*
from ./game.js -- which we are seeking to replace by gameV2.ts
    const {
      info = {},
      grid = [[{}]],
      solution = [['']],
      circles = [],
      chat = {messages: []},
      clues = {},
      clock = {
        lastUpdated: 0,
        totalTime: 0,
        paused: true,
      },
      cursors = [],
      // users is a mapping from id -> user info. fields include:
      // color: string
      // displayName: string
      users = {},
      solved = false,
      themeColor = MAIN_BLUE_3,
      // themeColor = GREENISH,
    } = params.game;
    */

// TODO move GameJson to a shared type, probably (closer to where InfoJson / CluesJson are declared)
export interface GameJson {
  info: InfoJson;
  grid: GridData;
  solution: string[][];
  clues: CluesJson;
}
export interface GameState {
  loaded: boolean;
  game: null | GameJson;
  // a lot of the previous implementation of GameState is suboptimal
  // TODO - add scoreboard for battle
  // TODO - add a list of users + track their activity
}

interface GameReducerFn<T extends GameEventType = GameEventType> {
  (game: GameState, params: GameEventParams[T], timestamp: number): GameState;
}

const userPingReducer: GameReducerFn<GameEventType.USER_PING> = (gameState, params, timestamp) => {
  return gameState;
};

const initializeGameReducer: GameReducerFn<GameEventType.INITIALIZE_GAME> = (gameState, params) => ({
  loaded: true,
  game: {
    ...initialGameState.game,
    pid: params.pid,
    ...params.game,
  },
});

export const initialGameState: GameState = {
  loaded: false,
  game: null,
};

export const gameReducer = (game: GameState, event: GameEvent, options = {}): GameState => {
  try {
    if (!game.loaded && !isInitializeGameEvent(event)) {
      console.error('Error handling event, game not yet loaded', event);
      return game;
    }

    if (isUserPingGameEvent(event)) {
      return userPingReducer(game, event.params, event.timestamp);
    } else if (isInitializeGameEvent(event)) {
      return initializeGameReducer(game, event.params, event.timestamp);
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
