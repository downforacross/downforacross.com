import {getUser} from '../store/user';

export enum RoomEventType {
  USER_PING = 'USER_PING',
  SET_GAME = 'SET_GAME',
}

export interface RoomEventParams {
  [RoomEventType.USER_PING]: {
    uid: string;
  };
  [RoomEventType.SET_GAME]: {
    gid: string;
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

export const isUserPingRoomEvent = (event: RoomEvent): event is RoomEvent<RoomEventType.USER_PING> =>
  event.type === RoomEventType.USER_PING;

export const SetGameRoomEvent = (gid: string): RoomEvent<RoomEventType.SET_GAME> => ({
  timestamp: Date.now(),
  type: RoomEventType.SET_GAME,
  uid: getUser().id,
  params: {
    gid,
  },
});

export const isSetGameEvent = (event: RoomEvent): event is RoomEvent<RoomEventType.SET_GAME> =>
  event.type === RoomEventType.SET_GAME;
