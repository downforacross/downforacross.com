import {RoomEventParams, RoomEvent, RoomEventType} from '@shared/roomEvents';
import _ from 'lodash';

interface RoomState {}

interface RoomReducerFn<T extends RoomEventType = RoomEventType> {
  (room: RoomState, params: RoomEventParams[T], timestamp: number): RoomState;
}

const userPingReducer: RoomReducerFn<RoomEventType.USER_PING> = (room, params, timestamp) => ({
  ...room,
});

export const reduce = (room: RoomState, event: RoomEvent, options = {}): RoomState => {
  try {
    switch (event.type) {
      case RoomEventType.USER_PING:
        return userPingReducer(room, event.params, event.timestamp);
      default:
        console.error('event', event.type, 'not found');
        return room;
    }
  } catch (e) {
    console.error('Error handling event', event);
    return room;
  }
};
