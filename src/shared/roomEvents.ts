enum RoomEventType {
  USER_PING = 'USER_PING',
}

export interface RoomEventParams {
  [RoomEventType.USER_PING]: {};
}

export interface RoomEvent<T extends RoomEventType = RoomEventType> {
  timestamp: number;
  type: T;
  params: RoomEventParams[T];
}
