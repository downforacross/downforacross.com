import {GameState} from './types/GameState';

export const initialState: GameState = {
  loaded: false,
  started: false,
  startedAt: null,
  game: null,
  users: {},
  teams: {
    1: {
      id: 1,
      color: 'orange',
      score: 0,
      guesses: 0,
      name: 'Team 1',
      lockedUntil: 0,
    },
    2: {
      id: 2,
      color: 'purple',
      score: 0,
      guesses: 0,
      name: 'Team 2',
      lockedUntil: 0,
    },
  },
  chat: {
    messages: [],
  },
};
