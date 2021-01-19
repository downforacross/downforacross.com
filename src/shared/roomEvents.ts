import {getUser} from '../store/user';

export enum RoomEventType {
  USER_PING = 'USER_PING',
}

export interface RoomEventParams {
  [RoomEventType.USER_PING]: {
    uid: string;
  };
}

export interface RoomEvent<T extends RoomEventType = RoomEventType> {
  timestamp: number;
  type: T;
  params: RoomEventParams[T];
  uid: string;
}

export const UserPingRoomEvent = (): RoomEvent<RoomEventType.USER_PING> => ({
  timestamp: Date.now(),
  type: RoomEventType.USER_PING,
  uid: getUser().id,
  params: {
    uid: getUser().id,
  },
});
