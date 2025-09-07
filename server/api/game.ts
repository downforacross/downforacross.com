import express from 'express';
import {CreateGameResponse, CreateGameRequest} from '../../src/shared/types';

import {addInitialGameEvent} from '../model/game';

const router = express.Router();

router.post<{}, CreateGameResponse, CreateGameRequest>('/', async (req, res) => {
  console.log('got req', req.headers, req.body);
  const gid = await addInitialGameEvent(req.body.gid, req.body.pid);
  res.json({
    gid,
  });
});

router.get<{gid: string}>('/:gid', async (req, res) => {
  try {
    const {gid} = req.params;
    const puzzleSolves = await getPuzzleSolves([gid]);
    
    if (puzzleSolves.length === 0) {
      return res.status(404).json({error: 'Game not found'});
    }

    const gameState = puzzleSolves[0];
    const puzzleInfo = await getPuzzleInfo(gameState.pid) as InfoJson;
    
    res.json({
      title: gameState.title,
      author: puzzleInfo?.author || 'Unknown',
      duration: gameState.time_taken_to_solve,
      size: gameState.size
    });
  } catch (error) {
    console.error('Error fetching game state:', error);
    res.status(500).json({error: 'Internal server error'});
  }
});

export default router;
