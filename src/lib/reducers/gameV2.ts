import {
  GameEvent,
  GameEventParams,
  GameEventType,
  isInitializeGameEvent,
  isUserPingGameEvent,
} from '../../shared/gameEvents';
import _ from 'lodash';
import {InfoJson} from '../../shared/types';
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
export interface GameState {
  loaded: boolean;
  info: InfoJson;
  grid: GridData;
  solution: string[][];
  // a lot of the previous implementation of GameState is suboptimal
  // TODO - add scoreboard for battle
  // TODO - add a list of users + track their activity
}

interface GameReducerFn<T extends GameEventType = GameEventType> {
  (game: GameState, params: GameEventParams[T], timestamp: number): GameState;
}

const userPingReducer: GameReducerFn<GameEventType.USER_PING> = (game, params, timestamp) => {
  return game;
};

const initializeGameReducer: GameReducerFn<GameEventType.INITIALIZE_GAME> = (game, params) => ({
  ...game,
  loaded: true,
  pid: params.pid,
  ...params.game,
});

export const initialGameState: GameState = {
  loaded: false,
  info: {
    title: '',
    author: '',
    description: '',
    copyright: '',
  },
  grid: [[{}]],
  solution: [['A']],
};

export const gameReducer = (game: GameState, event: GameEvent, options = {}): GameState => {
  try {
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
