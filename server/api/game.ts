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

export default router;
