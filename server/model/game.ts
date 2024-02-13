import _ from 'lodash';
// @ts-ignore
import {makeGrid} from '../gameUtils';
import {pool} from './pool';
import {getPuzzle} from './puzzle';

export async function getGameEvents(gid: string) {
  const startTime = Date.now();
  const res = await pool.query('SELECT event_payload FROM game_events WHERE gid=$1 ORDER BY ts ASC', [gid]);
  const events = _.map(res.rows, 'event_payload');
  const ms = Date.now() - startTime;
  console.log(`getGameEvents(${gid}) took ${ms}ms`);
  return events;
}

export async function getGameInfo(gid: string) {
  const res = await pool.query("SELECT event_payload FROM game_events WHERE gid=$1 AND event_type='create'", [
    gid,
  ]);
  if (res.rowCount != 1) {
    console.log(`Could not find info for game ${gid}`);
    return {};
  }

  const info = res.rows[0].event_payload.params.game.info;
  console.log(`${gid} game info: ${JSON.stringify(info)}`);
  return info;
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

export async function addInitialGameEvent(gid: string, pid: string) {
  const puzzle = await getPuzzle(pid);
  console.log('got puzzle', puzzle);
  const {info = {}, grid: solution = [['']], circles = []} = puzzle;

  const gridObject = makeGrid(solution);
  const clues = gridObject.alignClues(puzzle.clues);
  const grid = gridObject.toArray();

  const initialEvent = {
    user: '',
    timestamp: Date.now(),
    type: 'create',
    params: {
      pid,
      version: 1.0,
      game: {
        info,
        grid,
        solution,
        circles,
        chat: {messages: []},
        cursor: {},
        clock: {
          lastUpdated: 0,
          totalTime: 0,
          trueTotalTime: 0,
          paused: true,
        },
        solved: false,
        clues,
      },
    },
  };
  addGameEvent(gid, initialEvent);
}
