import {GameEvent, GameEventType} from './GameEvent';

export const makeGameEventTypeGuard = <T extends GameEventType>(t: T) => (
  event: GameEvent
): event is GameEvent<T> => event.type === t;
