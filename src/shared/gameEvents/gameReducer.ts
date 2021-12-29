import allEventDefs from './allEventDefs';
import {initialState} from './initialState';
import {GameEvent} from './types/GameEvent';
import {GameState} from './types/GameState';

export default (state: GameState, event: GameEvent): GameState => {
  if (!state) state = initialState;
  if (!event) return state;
  if (!(event.type in allEventDefs)) {
    console.warn(`Game event not implemented: ${event.type}`);
  }
  return allEventDefs[event.type]?.reducer(state, event.params as any, event.timestamp) ?? state; // TODO fix ts here
};
