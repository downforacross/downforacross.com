/* eslint @typescript-eslint/no-unused-vars : "warn" */
import {GameEvent} from '../../shared/gameEvents/types/GameEvent';
import {GameState} from '../../shared/gameEvents/types/GameState';

export interface ToolbarActions {
  checkCell(): void;
}

export interface DispatchFn {
  // TODO move to useEventDispatchFn
  (gameEvent: GameEvent): Promise<void>;
}
// translate <Player/> callbacks to game events emitted
// TODO: copy paste logic from src/components/Game.js
export const useToolbarActions = (
  dispatch: DispatchFn,
  gameState: GameState,
  id: string
): ToolbarActions => ({
  checkCell() {
    dispatch({
      type: 'check',
      params: {
        scope: [gameState.users[id].cursor!],
        id,
      },
    });
  },
});
