import {GameEventType} from './GameEvent';
import {makeGameEventTypeGuard} from './makeGameEventTypeGuard';

export const isInitializeGameEvent = makeGameEventTypeGuard(GameEventType.initializeGame);
