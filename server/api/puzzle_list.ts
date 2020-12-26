import {ListPuzzleResponse} from '@shared/types';
import express from 'express';
import _ from 'lodash';
import {listPuzzles} from '../model/puzzle';

const router = express.Router();

router.get<{}, ListPuzzleResponse>('/', async (req, res, next) => {
  console.log('got req', req.query);
  const page = Number.parseInt(req.query.page as string);
  const pageSize = Number.parseInt(req.query.pageSize as string);
  if (!(Number.isFinite(page) && Number.isFinite(pageSize))) {
    next(_.assign(new Error('page and pageSize should be integers'), {statusCode: 400}));
  }
  const result = await listPuzzles({}, pageSize, page * pageSize);
  res.json({
    puzzles: result,
  });
});

export default router;
