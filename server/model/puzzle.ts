import _ from 'lodash';
import uuid from 'uuid';
import {pid} from 'process';
import {pool} from './pool';

async function listPuzzles(filter: {}, limit: number, offset: number) {
  const startTime = Date.now();
  const res = await pool.query('SELECT * FROM puzzles ORDER BY pid DESC LIMIT $1 OFFSET $2', [limit, offset]);
  const puzzles = res.rows; // TODO omit the clues to save bandwidth
  const ms = Date.now() - startTime;
  console.log(`listPuzzles (${pid}) took ${ms}ms`);
  console.log('returning', puzzles);
  return puzzles;
}

interface AddPuzzleRequest {}
async function addPuzzle(puzzle: AddPuzzleRequest, isPublic = false) {
  let pid = uuid.v4().substr(0, 8);
  const uploaded_at = Date.now();
  await pool.query(
    `
      INSERT INTO puzzles (pid, uploaded_at, is_public, content)
      VALUES ($1, $2, $3, $4)`,
    [pid, uploaded_at, isPublic, puzzle]
  );
  return pid;
}

export {listPuzzles, addPuzzle};
