// ========== GET /api/stats ============

import qs from 'qs';
import {SERVER_URL} from './constants';
import {ListPuzzleStatsRequest, ListPuzzleStatsResponse} from '../shared/types';

export async function fetchStats(query: ListPuzzleStatsRequest) {
  const resp = await fetch(`${SERVER_URL}/api/stats?${qs.stringify(query)}`);
  const allStats: ListPuzzleStatsResponse = await resp.json();
  return allStats;
}
