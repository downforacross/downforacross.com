/* eslint @typescript-eslint/no-unused-vars : "warn" */
import {GameEvent} from '../../shared/gameEvents/types/GameEvent';
import {CellCoords} from '../Grid/types';

export interface PlayerActions {
  updateCursor(nCursor: CellCoords): void;
  updateGrid(r: number, c: number, value: string): void;
}

interface DispatchFn {
  (gameEvent: GameEvent): Promise<void>;
}
// translate <Player/> callbacks to game events emitted
// TODO: copy paste logic from src/components/Game.js
export const usePlayerActions = (dispatch: DispatchFn, id: string): PlayerActions => ({
  updateCursor(nCursor: CellCoords) {
    // dispatch()
    // TODO!!
    // socket?.emit(''); // TODO optimistic events
  },
  updateGrid(r: number, c: number, value: string) {
    dispatch({type: 'updateCell', params: {cell: {r, c}, value, id}});
    // TODO
  },
});
