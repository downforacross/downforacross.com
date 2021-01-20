export enum GameEventType {
  USER_PING = 'USER_PING',
}

export interface GameEventParams {
  [GameEventType.USER_PING]: {
    uid: string;
  };
}

export interface GameEvent<T extends GameEventType = GameEventType> {
  timestamp: number;
  type: T;
  params: GameEventParams[T];
  uid: string;
}

export const isUserPingGameEvent = (event: GameEvent): event is GameEvent<GameEventType.USER_PING> => {
  return event.type === GameEventType.USER_PING;
};
