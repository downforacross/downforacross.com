import allEventDefs from './allEventDefs';
import {GameEvent} from './types/GameEvent';
import {GameState} from './types/GameState';

export default (state: GameState, event: GameEvent): GameState => {
  console.log(event);
  if (!(event.type in allEventDefs)) {
    console.warn(`Game event not implemented: ${event.type}`);
  }
  return allEventDefs[event.type]?.reducer(state, event.params as any) ?? state; // TODO fix ts here
};
