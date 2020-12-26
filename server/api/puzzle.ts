import {AddPuzzleResponse, AddPuzzleRequest} from '@shared/types';
import express from 'express';

import {addPuzzle} from '../model/puzzle';

const router = express.Router();

router.post<{}, AddPuzzleResponse, AddPuzzleRequest>('/', async (req, res) => {
  console.log('got req', req.headers, req.body);
  await addPuzzle(req.body.puzzle, req.body.isPublic);
  const pid = '123';
  res.json({
    pid,
  });
});

export default router;
