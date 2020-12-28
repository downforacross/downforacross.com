import {CreateGameResponse, CreateGameRequest, PuzzleJson} from '@shared/types';
// @ts-ignore
import {GridWrapper} from '@lib/wrappers/GridWrapper';
import express from 'express';
import _ from 'lodash';

import {addEvent, InitialGameEvent} from '../model/game';
import {getPuzzle} from '../model/puzzle';

const router = express.Router();

const CURRENT_VERSION = '2.0';

const transformPuzzleToInitialGameEvent = (puzzle: PuzzleJson, pid: string): InitialGameEvent => {
  console.log(puzzle);
  const gridWrapper = new GridWrapper(puzzle.grid);
  const clues = gridWrapper.alignClues(puzzle.clues);
  const grid = gridWrapper.toArray();

  const game = {
    pid,
    info: puzzle.info,
    circles: puzzle.circles,
    shades: puzzle.shades,
    clues,
    grid,
    createTime: Date.now(),
    startTime: null,
    chat: {
      users: [],
      messages: [],
    },
  };
  return {
    type: 'create',
    timestamp: Date.now(),
    params: {
      pid,
      version: CURRENT_VERSION,
      game,
    },
  };
};
router.post<{}, CreateGameResponse, CreateGameRequest>('/', async (req, res, next) => {
  console.log('got req', req.headers, req.body);
  const pid = req.body.pid;
  const gid = req.body.gid; // TODO generate & increment gid in backend
  const puzzle = await getPuzzle(pid);
  if (!puzzle) {
    return next(_.assign(new Error('Invalid pid'), {statusCode: 400}));
  }
  const initializeGameEvent = transformPuzzleToInitialGameEvent(puzzle, pid);
  await addEvent(gid, initializeGameEvent);
  res.json({
    gid,
  });
});

export default router;
