/* eslint @typescript-eslint/no-unused-vars : "warn" */
import {CellCoords} from '../Grid/types';

export interface PlayerActions {
  updateCursor(nCursor: CellCoords): void;
  updateGrid(r: number, c: number, value: string): void;
}

// translate <Player/> callbacks to game events emitted
// TODO: copy paste logic from src/components/Game.js
export const usePlayerActions = (socket: SocketIOClient.Socket | undefined): PlayerActions => ({
  updateCursor(nCursor: CellCoords) {
    // TODO!!
    // socket?.emit(''); // TODO optimistic events
  },
  updateGrid(r: number, c: number, value: string) {
    // TODO
  },
});
