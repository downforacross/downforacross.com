/* eslint @typescript-eslint/no-unused-vars : "warn" */
import {GameEvent} from '../../shared/fencingGameEvents/types/GameEvent';
import {CellCoords} from '../Grid/types';

export interface PlayerActions {
  updateCursor(nCursor: CellCoords): void;
  updateGrid(r: number, c: number, value: string): void;
  addPing(): void; // TODO
  startGame(): void;
  updateTeamName(name: string): void;
}

export interface DispatchFn {
  // TODO move to useEventDispatchFn
  (gameEvent: GameEvent): Promise<void>;
}

// translate <Player/> callbacks to game events emitted
// TODO: copy paste logic from src/components/Game.js
export const usePlayerActions = (dispatch: DispatchFn, id: string): PlayerActions => ({
  updateCursor(nCursor: CellCoords) {
    dispatch({type: 'updateCursor', params: {cell: nCursor, id}});
  },
  updateGrid(r: number, c: number, value: string) {
    dispatch({type: 'updateCell', params: {cell: {r, c}, value, id}});
    setTimeout(() => {
      dispatch({type: 'check', params: {scope: [{r, c}], id}}); // TODO settimeout for auto-check-on-cooldown
    }, 10);
  },
  addPing() {},
  updateTeamName(name: string) {
    dispatch({type: 'updateTeamName', params: {}});
  },
  startGame() {
    dispatch({type: 'startGame', params: {}});
  },
});
