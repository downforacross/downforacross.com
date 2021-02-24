/* eslint @typescript-eslint/no-unused-vars : "warn" */
import {ModernArtEvent} from './events/types';

export interface PlayerActions {
  startGame(): void;
}

// translate <Player/> callbacks to game events emitted
// TODO: copy paste logic from src/components/Game.js
export const usePlayerActions = (dispatch: (event: ModernArtEvent) => Promise<void>): PlayerActions => ({
  startGame() {
    dispatch({
      type: 'start_game',
      params: {},
    });
    // TODO
  },
});
