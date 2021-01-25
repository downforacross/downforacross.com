import express from 'express';
import {nextTick} from 'process';
import {RecordSolveRequest, RecordSolveResponse} from '../../src/shared/types';
import {recordSolve} from '../model/puzzle';

const router = express.Router();

router.post<{pid: string}, RecordSolveResponse, RecordSolveRequest>('/:pid', async (req, res, next) => {
  const recordSolveRequest = req.body;
  try {
    await recordSolve(req.params.pid, recordSolveRequest.gid, recordSolveRequest.time_to_solve);
    res.json({});
  } catch (e) {
    next(e);
  }
});

export default router;
