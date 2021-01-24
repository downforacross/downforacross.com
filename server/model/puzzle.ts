import _ from 'lodash';
import Joi from 'joi';
import uuid from 'uuid';
import {pool} from './pool';
import {PuzzleJson} from '@shared/types';
import {ListPuzzleRequestFilters} from '../../src/shared/types';

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
  filter: ListPuzzleRequestFilters,
  limit: number,
  offset: number
): Promise<
  {
    pid: string;
    content: PuzzleJson;
  }[]
> {
  const startTime = Date.now();
  const parametersForTitleAuthorFilter = filter.nameOrTitleFilter.split(/\s/).map((s) => '%' + s + '%');
  const parameterOffset = 4;
  // see https://github.com/brianc/node-postgres/wiki/FAQ#11-how-do-i-build-a-where-foo-in--query-to-find-rows-matching-an-array-of-values
  // for why this is okay.
  // we create the query this way as POSTGRES optimizer does not use the index for an ILIKE ALL cause, but will for multiple ands
  // note this is not vulnerable to SQL injection because this string is just dynamically constructing params of the form $#
  // which we fully control.
  const parameterizedTileAuthorFilter = parametersForTitleAuthorFilter
    .map(function (_s, idx) {
      return (
        "AND ((content -> 'info' ->> 'title') || ' ' || (content->'info'->>'author')) ILIKE $" +
        (idx + parameterOffset)
      );
    })
    .join('\n');
  const {rows} = await pool.query(
    `
      SELECT pid, uploaded_at, content
      FROM puzzles
      WHERE is_public = true
      AND (content->'info'->>'type') = ANY($1)
      ${parameterizedTileAuthorFilter}
      ORDER BY pid DESC 
      LIMIT $2
      OFFSET $3
    `,
    [mapSizeFilterForDB(filter.sizeFilter), limit, offset, ...parametersForTitleAuthorFilter]
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

const mapSizeFilterForDB = (sizeFilter: ListPuzzleRequestFilters['sizeFilter']): string[] => {
  let ret = [];
  if (sizeFilter.Mini) {
    ret.push('Mini Puzzle');
  }
  if (sizeFilter.Standard) {
    ret.push('Daily Puzzle');
  }
  return ret;
};

const string = () => Joi.string().allow(''); // https://github.com/sideway/joi/blob/master/API.md#string

const puzzleValidator = Joi.object({
  grid: Joi.array().items(Joi.array().items(string())),
  info: Joi.object({
    type: string().optional(),
    title: string(),
    author: string(),
    copyright: string().optional(),
    description: string().optional(),
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

export async function recordSolve(pid: string, gid: string, timeToSolve: number) {
  const solved_time = Date.now();
  await pool.query(
    `
      INSERT INTO puzzle_solves (pid, gid, solved_time, time_taken_to_solve)
      VALUES ($1, $2, to_timestamp($3), $4)`,
    [pid, gid, solved_time, timeToSolve]
  );
}
