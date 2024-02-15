import express from 'express';
import {
  IncrementGidRequest,
  IncrementGidResponse,
  IncrementPidRequest,
  IncrementPidResponse,
} from '@shared/types';
import {incrementGid, incrementPid} from '../model/counters';

const router = express.Router();

router.post<{}, IncrementGidResponse, IncrementGidRequest>('/gid', async (req, res) => {
  console.log('increment gid');
  const gid = await incrementGid();
  res.json({
    gid,
  });
});

router.post<{}, IncrementPidResponse, IncrementPidRequest>('/pid', async (req, res) => {
  console.log('increment pid');
  const pid = await incrementPid();
  res.json({
    pid,
  });
});

export default router;
