export enum GameEventType {
  USER_PING = 'USER_PING',
  INITIALIZE_GAME = 'create',
}

export interface GameEventParams {
  [GameEventType.USER_PING]: {
    uid: string;
  };
  [GameEventType.INITIALIZE_GAME]: {
    pid: string;
    game: any;
  };
}

export interface GameEvent<T extends GameEventType = GameEventType> {
  timestamp: number;
  type: T;
  params: GameEventParams[T];
  uid: string;
}

export const isUserPingGameEvent = (event: GameEvent): event is GameEvent<GameEventType.USER_PING> =>
  event.type === GameEventType.USER_PING;

export const isInitializeGameEvent = (event: GameEvent): event is GameEvent<GameEventType.INITIALIZE_GAME> =>
  // returns a "type guard"
  event.type === GameEventType.INITIALIZE_GAME;
