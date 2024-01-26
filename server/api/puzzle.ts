import {AddPuzzleResponse, AddPuzzleRequest} from '@shared/types';
import express from 'express';

import {addPuzzle, getMatchingPuzzle} from '../model/puzzle';

const router = express.Router();

router.post<{}, AddPuzzleResponse, AddPuzzleRequest>('/', async (req, res) => {
  console.log('got req', req.headers, req.body);

  try {
    const pid = await addPuzzle(req.body.puzzle, req.body.isPublic, req.body.pid);
    res.json({
      pid,
    });
  } catch (err) {
    if (err.code == '23505') {
      const pid = await getMatchingPuzzle(req.body.puzzle);
      console.log(`Unique constraint violated, attempt pid (${req.body.pid}) for existing pid (${pid})`);
      res.status(400).json({duplicatePuzzle: pid});
    } else {
      console.error(err.message);
      console.error(err.code);
      res.status(400).json();
    }
  }
});

export default router;
