/* eslint @typescript-eslint/no-unused-vars : "warn" */
import {ModernArtEvent} from './events/types';

export interface PlayerActions {
  startGame(): void;
  step(): void;
  startAuction(userId: string, idx: number): void;
  submitBid(userId: string, bidAmount: number): void;
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
  step() {
    dispatch({
      type: 'step',
      params: {},
    });
  },
  startAuction(userId, idx) {
    dispatch({
      type: 'start_auction',
      params: {
        userId,
        idx,
      },
    });
  },
  submitBid(userId, bidAmount) {
    dispatch({
      type: 'submit_bid',
      params: {
        userId,
        bidAmount,
      },
    });
  },
});
