import {initialState, ModernArtEvent, ModernArtState} from './events/types';
import {modernArtReducer} from './events/modernArtReducer';
/**
 * Computes the current game state, given a list of events.
 * @param events list of events
 */
export const useGameState = (events: ModernArtEvent[]): ModernArtState => {
  // TODO use memoization
  // (a data structure!!! that uses sqrt n bucketing to avoid re-evaluating the "sum" of a list from scratch every time it is appended to)
  // "a time traveling data structure" aka persistent array reduction
  console.log('reducing', events);
  return events.reduce<ModernArtState>(modernArtReducer, initialState);
};
