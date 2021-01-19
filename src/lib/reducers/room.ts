import {RoomEventParams, RoomEventType} from '../../shared/roomEvents';
import _ from 'lodash';

interface RoomState {
  users: {
    uid: string;
    lastPing: number;
  }[];
}

export interface RoomEvent<T extends RoomEventType = RoomEventType> {
  timestamp: number;
  type: T;
  params: RoomEventParams[T];
}

interface RoomReducerFn<T extends RoomEventType = RoomEventType> {
  (room: RoomState, params: RoomEventParams[T], timestamp: number): RoomState;
}

const userPingReducer: RoomReducerFn<RoomEventType.USER_PING> = (room, params, timestamp) => {
  const newUsers = [
    {
      uid: params.uid,
      lastPing: timestamp,
    },
    ...room.users.filter((user) => user.uid !== params.uid),
  ];
  return {
    ...room,
    users: newUsers,
  };
};

export const initialRoomState: RoomState = {
  users: [],
};
export const roomReducer = (room: RoomState, event: RoomEvent, options = {}): RoomState => {
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
