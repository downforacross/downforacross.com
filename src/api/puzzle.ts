import {SERVER_URL} from './constants';
import {AddPuzzleRequest, AddPuzzleResponse} from '../shared/types';
console.log(hi);
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
