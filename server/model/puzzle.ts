import _ from 'lodash';
import uuid from 'uuid';
import {pid} from 'process';
import {pool} from './pool';

async function listPuzzles(filter: {}, limit: number, offset: number) {
  const startTime = Date.now();
  const {rows} = await pool.query(
    `
      SELECT pid, uploaded_at, is_public, content
      FROM puzzles
      ORDER BY pid DESC 
      LIMIT $1
      OFFSET $2
    `,
    [limit, offset]
  );
  const puzzles = rows.map((row: {pid: string; uploaded_at: string; is_public: boolean; content: string}) => {
    console.log('row', row);
    return {};
  }); // TODO omit the clues to save bandwidth
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
      VALUES ($1, to_timestamp($2), $3, $4)`,
    [pid, uploaded_at / 1000, isPublic, puzzle]
  );
  return pid;
}

export {listPuzzles, addPuzzle};
