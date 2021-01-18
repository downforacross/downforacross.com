import _ from 'lodash';
import {pool} from './pool';

export async function getRoomEvents(rid: string) {
  const startTime = Date.now();
  const res = await pool.query('SELECT event_payload FROM room_events WHERE rid=$1', [rid]);
  const events = _.map(res.rows, 'event_payload');
  const ms = Date.now() - startTime;
  console.log(`getEvents(${rid}) took ${ms}ms`);
  return events;
}

export interface RoomEvent {
  user?: string; // always null actually
  timestamp: number;
  type: string; // todo string literal union type
  params: any; // todo extend RoomEvent w/ specific types of Room events
}

export async function addRoomEvent(rid: string, event: RoomEvent) {
  const startTime = Date.now();
  await pool.query(
    `
      INSERT INTO room_events (rid, uid, ts, event_type, event_payload)
      VALUES ($1, $2, $3, $4, $5)`,
    [rid, event.user, new Date(event.timestamp).toISOString(), event.type, event]
  );
  const ms = Date.now() - startTime;
  console.log(`addRoomEvent(${rid}, ${event.type}) took ${ms}ms`);
}
