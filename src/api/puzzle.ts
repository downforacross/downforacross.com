import {SERVER_URL} from './constants';
import {AddPuzzleRequest, AddPuzzleResponse, RecordSolveRequest, RecordSolveResponse} from '../shared/types';

export async function createNewPuzzle(
  puzzle: AddPuzzleRequest,
  pid: string | undefined,
  opts: {isPublic?: boolean} = {}
): Promise<AddPuzzleResponse> {
  const url = `${SERVER_URL}/api/puzzle`;
  const data = {
    puzzle,
    pid,
    isPublic: !!opts.isPublic,
  };
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return resp.json();
}

export async function recordSolve(
  pid: string,
  gid: string,
  time_to_solve: number
): Promise<RecordSolveResponse> {
  const url = `${SERVER_URL}/api/record_solve`;
  const data: RecordSolveRequest = {
    pid,
    gid,
    time_to_solve,
  };
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return resp.json();
}
