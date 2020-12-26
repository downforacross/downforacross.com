import express from 'express';

import {addPuzzle, PuzzleJson} from '../model/puzzle';

const router = express.Router();

interface AddPuzzleRequest {
  puzzle: PuzzleJson;
  isPublic: boolean;
}

interface AddPuzzleResponse {
  pid: string;
}

router.post<{}, AddPuzzleResponse, AddPuzzleRequest>('/', async (req, res) => {
  console.log('got req', req.headers, req.body);
  await addPuzzle(req.body.puzzle, req.body.isPublic);
  const pid = '123';
  res.json({
    pid,
  });
});

export default router;
