// ========== GET /api/puzzlelist ============

import {ListPuzzleRequest, ListPuzzleResponse} from '../shared/types';
import qs from 'qs';
import {SERVER_URL} from './constants';

export async function fetchPuzzleList(query: ListPuzzleRequest): Promise<ListPuzzleResponse> {
  const url = `${SERVER_URL}/api/puzzle_list?${qs.stringify(query)}`;
  const resp = await fetch(url);
  return await resp.json();
}
