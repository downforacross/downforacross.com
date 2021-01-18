// ========== GET /api/puzzlelist ============

import {ListPuzzleResponse} from '../shared/types';
import qs from 'qs';
import {SERVER_URL} from './constants';

export async function fetchPuzzleList(query: {page: number; pageSize: number}): Promise<ListPuzzleResponse> {
  const url = `${SERVER_URL}/api/puzzle_list?${qs.stringify(query)}`;
  const resp = await fetch(url);
  const json = await resp.json();
  const puzzleList: ListPuzzleResponse = json;

  return puzzleList;
}
