import {IncrementGidResponse, IncrementPidResponse} from '../shared/types';
import {SERVER_URL} from './constants';

// ========== POST /api/counters/gid ============
export async function incrementGid(): Promise<IncrementGidResponse> {
  const url = `${SERVER_URL}/api/counters/gid`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return resp.json();
}

// ========== POST /api/counters/pid ============
export async function incrementPid(): Promise<IncrementPidResponse> {
  const url = `${SERVER_URL}/api/counters/pid`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return resp.json();
}
