import {ListPuzzleResponse} from '@shared/types';
import express from 'express';
import _ from 'lodash';
import {listPuzzles} from '../model/puzzle';
import {getPuzzleStats} from '../model/stats';
import {ListPuzzleRequestFilters} from '../../src/shared/types';

const router = express.Router();

router.get<{}, ListPuzzleResponse>('/', async (req, res, next) => {
  console.log('got req', req.query);
  const page = Number.parseInt(req.query.page as string);
  const pageSize = Number.parseInt(req.query.pageSize as string);
  const rawFilters = req.query.filter as any;
  const filters: ListPuzzleRequestFilters = {
    sizeFilter: {
      Mini: rawFilters['sizeFilter']['Mini'] === 'true',
      Standard: rawFilters['sizeFilter']['Standard'] === 'true',
    },
    nameOrTitleFilter: rawFilters['nameOrTitleFilter'] as string,
  };
  if (!(Number.isFinite(page) && Number.isFinite(pageSize))) {
    next(_.assign(new Error('page and pageSize should be integers'), {statusCode: 400}));
  }
  const rawPuzzleList = await listPuzzles(filters, pageSize, page * pageSize);
  const puzzles = rawPuzzleList.map((puzzle) => ({
    pid: puzzle.pid,
    content: puzzle.content,
    stats: {numSolves: puzzle.times_solved},
  }));
  res.json({
    puzzles,
  });
});

export default router;
