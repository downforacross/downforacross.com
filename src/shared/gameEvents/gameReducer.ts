import allEventDefs from './allEventDefs';
import {GameEvent} from './types/GameEvent';
import {GameState} from './types/GameState';

export default (state: GameState, event: GameEvent): GameState => {
  if (!(event.type in allEventDefs)) {
    console.warn(`Game event not implemented: ${event.type}`);
  }
  return allEventDefs[event.type]?.reducer(state, event.params) ?? state; // TODO fix ts here
};

export const initialState: GameState = {
  loaded: false,
  game: null,
};
