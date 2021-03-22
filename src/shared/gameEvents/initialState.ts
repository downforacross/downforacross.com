import {GameState} from './types/GameState';

export const initialState: GameState = {
  loaded: false,
  game: null,
  users: {},
  teams: {
    1: {
      color: 'orange',
      score: 0,
      guesses: 0,
      name: 'Team 1',
    },
    2: {
      color: 'purple',
      score: 0,
      guesses: 0,
      name: 'Team 2',
    },
  },
};
