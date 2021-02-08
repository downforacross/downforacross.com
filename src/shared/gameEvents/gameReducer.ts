import allEventDefs from './allEventDefs';
import {GameEvent} from './types/GameEvent';
import {GameState} from './types/GameState';

export default (state: GameState, event: GameEvent): GameState =>
  allEventDefs[event.type].reducer(state, event.params); // TODO fix ts here

export const initialState: GameState = {
  loaded: false,
  game: null,
};
