import _ from 'lodash';
import {pool} from './pool';

export async function getGameEvents(gid: string) {
  const startTime = Date.now();
  const res = await pool.query('SELECT event_payload FROM game_events WHERE gid=$1', [gid]);
  const events = _.map(res.rows, 'event_payload');
  const ms = Date.now() - startTime;
  console.log(`getGameEvents(${gid}) took ${ms}ms`);
  return events;
}

export interface GameEvent {
  user?: string; // always null actually
  timestamp: number;
  type: string; // todo string literal union type
  params: any; // todo extend GameEvent w/ specific types of game events
}

export interface InitialGameEvent extends GameEvent {
  type: 'create';
  params: {
    pid: string;
    version: string;
    game: any;
  };
}

export async function addGameEvent(gid: string, event: GameEvent) {
  const startTime = Date.now();
  await pool.query(
    `
      INSERT INTO game_events (gid, uid, ts, event_type, event_payload)
      VALUES ($1, $2, $3, $4, $5)`,
    [gid, event.user, new Date(event.timestamp).toISOString(), event.type, event]
  );
  const ms = Date.now() - startTime;
  console.log(`addGameEvent(${gid}, ${event.type}) took ${ms}ms`);
}
