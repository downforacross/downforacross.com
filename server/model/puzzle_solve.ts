import _ from 'lodash';
import {pool} from './pool';
import moment from 'moment';
import {PuzzleJson} from '@shared/types';

export type SolvedPuzzleType = {
  pid: string;
  gid: string;
  solved_time: moment.Moment;
  time_taken_to_solve: number;
  revealed_squares_count: number;
  checked_squares_count: number;
  title: string;
  size: string;
};

type RawFetchedPuzzleSolve = {
  pid: string;
  gid: string;
  content: PuzzleJson;
  solved_time: moment.Moment;
  time_taken_to_solve: number;
  event_type?: string;
  event_payload?: {
    params?: {scope?: {r: number; c: number}[]};
  };
};

export async function getPuzzleSolves(gids: string[]): Promise<SolvedPuzzleType[]> {
  const startTime = Date.now();
  const {rows}: {rows: RawFetchedPuzzleSolve[]} = await pool.query(
    `
      SELECT
        p.content,
        ps.pid,
        ps.gid,
        ps.solved_time,
        ps.time_taken_to_solve,
        ge.event_type,
        ge.event_payload
      FROM puzzle_solves ps
      JOIN puzzles p on ps.pid = p.pid
      LEFT JOIN game_events ge
        ON ps.gid = ge.gid AND ge.event_type IN ('check', 'reveal')
      WHERE ps.gid = ANY($1)
    `,
    [gids]
  );
  const puzzleIds = new Map<string, RawFetchedPuzzleSolve>();
  const revealedSquareByPuzzle = new Map<string, Set<string>>();
  const checkedSquareByPuzzle = new Map<string, Set<string>>();
  rows.forEach((row) => {
    if (!puzzleIds.has(row.pid)) {
      puzzleIds.set(row.pid, row);
    }
    const cells: string[] = row.event_payload?.params?.scope?.map((c) => JSON.stringify(c)) || [];

    if (row.event_type === 'reveal') {
      const revealedSquares = revealedSquareByPuzzle.get(row.pid) || new Set();
      cells.forEach(revealedSquares.add, revealedSquares);
      revealedSquareByPuzzle.set(row.pid, revealedSquares);
    } else if (row.event_type === 'check') {
      const checkedSquares = checkedSquareByPuzzle.get(row.pid) || new Set();
      cells.forEach(checkedSquares.add, checkedSquares);
      checkedSquareByPuzzle.set(row.pid, checkedSquares);
    }
  });

  const puzzleSolves = Array.from(puzzleIds)
    .map(([pid, puzzle]) => {
      const title = puzzle.content.info.title;
      const grid = puzzle.content.grid;
      const width = grid.length;
      const length = grid.length > 0 ? grid[0].length : 0;
      return {
        pid,
        gid: puzzle.gid,
        title,
        size: `${width}x${length}`,
        solved_time: moment(puzzle.solved_time, 'YYYY-MM-DD'),
        time_taken_to_solve: Number(puzzle.time_taken_to_solve),
        revealed_squares_count: (revealedSquareByPuzzle.get(puzzle.pid) || new Set()).size,
        checked_squares_count: (checkedSquareByPuzzle.get(puzzle.pid) || new Set()).size,
      };
    })
    .sort((a, b) => b.solved_time.utc().valueOf() - a.solved_time.utc().valueOf());
  const ms = Date.now() - startTime;
  console.log(`getPuzzleSolves took ${ms}ms for ${gids.length} gids`);
  return puzzleSolves;
}
