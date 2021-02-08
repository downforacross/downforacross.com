import {getUser} from '../../../store/user';
import {GameEvent, GameEventType} from './GameEvent';
import {makeGameEventTypeGuard} from './makeGameEventTypeGuard';

export const UserServerPingGameEvent = (): GameEvent<GameEventType.userServerPing> => ({
  timestamp: Date.now(),
  type: GameEventType.userServerPing,
  uid: getUser().id,
  params: {
    uid: getUser().id,
  },
});

export const isUserServerPingGameEvent = makeGameEventTypeGuard(GameEventType.userServerPing);
