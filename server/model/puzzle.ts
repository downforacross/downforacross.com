import _ from 'lodash';
import Joi from 'joi';
import uuid from 'uuid';
import {pool} from './pool';
import {PuzzleJson} from '@shared/types';

// ================ Read and Write methods used to interface with postgres ========== //

export async function getPuzzle(pid: string): Promise<PuzzleJson> {
  const startTime = Date.now();
  const {rows} = await pool.query(
    `
      SELECT content
      FROM puzzles
      WHERE pid = $1
    `,
    [pid]
  );
  const ms = Date.now() - startTime;
  console.log(`getPuzzle (${pid}) took ${ms}ms`);
  return _.first(rows)!;
}

export async function listPuzzles(
  filter: {},
  limit: number,
  offset: number
): Promise<
  {
    pid: string;
    content: PuzzleJson;
  }[]
> {
  const startTime = Date.now();
  const {rows} = await pool.query(
    `
      SELECT pid, uploaded_at, content
      FROM puzzles
      WHERE is_public = true
      ORDER BY pid DESC 
      LIMIT $1
      OFFSET $2
    `,
    [limit, offset]
  );
  const puzzles = rows.map(
    (row: {pid: string; uploaded_at: string; is_public: boolean; content: PuzzleJson}) => {
      return {
        ...row,
      };
    }
  );
  const ms = Date.now() - startTime;
  console.log(`listPuzzles (${JSON.stringify(filter)}, ${limit}, ${offset}) took ${ms}ms`);
  console.log('returning', puzzles);
  return puzzles;
}

const puzzleValidator = Joi.object({
  grid: Joi.array().items(Joi.array().items(Joi.string())),
  info: Joi.object({
    type: Joi.string().optional(),
    title: Joi.string(),
    author: Joi.string(),
    copyright: Joi.string().optional(),
    description: Joi.string().optional(),
  }),
  circles: Joi.array().optional(),
  shades: Joi.array().optional(),
  clues: Joi.object({
    across: Joi.array(),
    down: Joi.array(),
  }),
  private: Joi.boolean().optional(),
});

function validatePuzzle(puzzle: any) {
  console.log(_.keys(puzzle));
  const {error} = puzzleValidator.validate(puzzle);
  if (error) {
    throw new Error(error.message);
  }
}

export async function addPuzzle(puzzle: PuzzleJson, isPublic = false, pid?: string) {
  if (!pid) {
    pid = uuid.v4().substr(0, 8);
  }
  validatePuzzle(puzzle);
  const uploaded_at = Date.now();
  await pool.query(
    `
      INSERT INTO puzzles (pid, uploaded_at, is_public, content)
      VALUES ($1, to_timestamp($2), $3, $4)`,
    [pid, uploaded_at / 1000, isPublic, puzzle]
  );
  return pid;
}
