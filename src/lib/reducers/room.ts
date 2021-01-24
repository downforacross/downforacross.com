import {
  isSetGameEvent,
  isUserPingRoomEvent,
  RoomEvent,
  RoomEventParams,
  RoomEventType,
} from '../../shared/roomEvents';
import _ from 'lodash';

interface RoomState {
  users: {
    uid: string;
    lastPing: number;
  }[];
  games: {
    gid: string;
  }[];
}

interface RoomReducerFn<T extends RoomEventType = RoomEventType> {
  (room: RoomState, params: RoomEventParams[T], timestamp: number): RoomState;
}

const userPingReducer: RoomReducerFn<RoomEventType.USER_PING> = (room, params, timestamp) => {
  const nUsers = [
    {
      uid: params.uid,
      lastPing: timestamp,
    },
    ...room.users.filter((user) => user.uid !== params.uid),
  ];
  return {
    ...room,
    users: nUsers,
  };
};

const setGameReducer: RoomReducerFn<RoomEventType.SET_GAME> = (room, params, timestamp) => {
  const nGames = [
    {
      gid: params.gid,
    },
    ...room.games.filter((game) => game.gid !== params.gid),
  ];
  return {
    ...room,
    games: nGames,
  };
};

export const initialRoomState: RoomState = {
  users: [],
  games: [],
};
export const roomReducer = (room: RoomState, event: RoomEvent, options = {}): RoomState => {
  try {
    if (isUserPingRoomEvent(event)) {
      return userPingReducer(room, event.params, event.timestamp);
    } else if (isSetGameEvent(event)) {
      return setGameReducer(room, event.params, event.timestamp);
    } else {
      console.error('event', event.type, 'not found');
      return room;
    }
  } catch (e) {
    console.error('Error handling event', event);
    return room;
  }
};
