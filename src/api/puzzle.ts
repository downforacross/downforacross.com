import {SERVER_URL} from './constants';
import {AddPuzzleRequest} from '@shared/types';

export async function createNewPuzzle(puzzle: AddPuzzleRequest, opts: {isPublic?: boolean} = {}) {
  const url = `${SERVER_URL}/api/puzzle`;
  const data = {
    puzzle,
    isPublic: !!opts.isPublic,
  };
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  const {pid}: {pid: string} = await resp.json();
  return pid;
}
