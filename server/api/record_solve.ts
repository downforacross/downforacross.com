import express from 'express';
import {RecordSolveRequest, RecordSolveResponse} from '../../src/shared/types';
import {recordSolve} from '../model/puzzle';

const router = express.Router();

router.post<{}, RecordSolveResponse, RecordSolveRequest>('/', async (req, res) => {
  const recordSolveRequest = req.body;
  await recordSolve(recordSolveRequest.pid, recordSolveRequest.gid, recordSolveRequest.time_to_solve);
  res.json({});
});

export default router;
