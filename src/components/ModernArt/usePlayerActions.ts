/* eslint @typescript-eslint/no-unused-vars : "warn" */
import {ModernArtEvent} from './events/types';

export interface PlayerActions {
  startGame(): void;
  step(): void;
  startAuction(idx: number): void;
  submitBid(bidAmount: number): void;
  finishAuction(): void;
}

// translate <Player/> callbacks to game events emitted
// TODO: copy paste logic from src/components/Game.js
export const usePlayerActions = (
  dispatch: (event: ModernArtEvent) => Promise<void>,
  userId: string
): PlayerActions => ({
  startGame() {
    dispatch({
      type: 'start_game',
      params: {
        userId,
      },
    });
    // TODO
  },
  step() {
    dispatch({
      type: 'step',
      params: {
        userId,
      },
    });
  },
  startAuction(idx) {
    dispatch({
      type: 'start_auction',
      params: {
        userId,
        idx,
      },
    });
  },
  submitBid(bidAmount) {
    dispatch({
      type: 'submit_bid',
      params: {
        userId,
        bidAmount,
      },
    });
  },
  finishAuction() {
    dispatch({
      type: 'finish_auction',
      params: {
        userId,
      },
    });
  },
});
