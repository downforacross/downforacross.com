import {GameEvent, GameEventType} from './GameEvent';

export const isInitializeGameEvent = (event: GameEvent): event is GameEvent<GameEventType.initializeGame> =>
  event.type === GameEventType.initializeGame;
