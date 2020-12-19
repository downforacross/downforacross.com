// ========== GET /api/puzzlelist ============

import qs from 'qs';
import {SERVER_URL} from './constants';

export interface PuzzleList {
  puzzles: {
    pid: number;
    private: boolean;
    author: string;
    title: string;
    importedTime: number;
    info: {
      author: string;
      descripton: string;
      title: string;
      type: string;
    };
    stats: {
      numSolves: number;
    };
  }[];
}

export async function fetchPuzzleList(query: {page: number; pageSize: number}): Promise<PuzzleList> {
  const url = `${SERVER_URL}/api/puzzle_list?${qs.stringify(query)}`;
  const resp = await fetch(url);
  const json = await resp.json();
  const puzzleList: PuzzleList = json;

  return puzzleList;
}
