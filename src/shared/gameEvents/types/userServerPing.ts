import {getUser} from '../../../store/user';
import {GameEvent, GameEventType} from './GameEvent';

export const UserServerPingGameEvent = (): GameEvent<GameEventType.userServerPing> => ({
  timestamp: Date.now(),
  type: GameEventType.userServerPing,
  uid: getUser().id,
  params: {
    uid: getUser().id,
  },
});

export const isUserServerPingGameEvent = (event: GameEvent): event is GameEvent<GameEventType.userPing> =>
  event.type === GameEventType.userServerPing;
