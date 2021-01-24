// ========== GET /api/stats ============

import {SERVER_URL} from './constants';

interface Counts {
  gameEvents: number;
  activeGames: number;
  connections: number;
  bytesReceived: number;
  bytesSent: number;
}

interface LiveStats {
  serverStartDate: string;
  gamesCount: number;
  connectionsCount: number;
}

export interface TimeWindowStats {
  name: string;
  stats: {
    windowStart: number;
    prevCounts: Counts;
    counts: Counts;
    activeGids: string[];
    percentComplete: number;
  };
}

export interface AllStats {
  timeWindowStats?: TimeWindowStats[];
  liveStats?: LiveStats;
}

export async function fetchStats() {
  const resp = await fetch(`${SERVER_URL}/api/stats`);
  const allStats: AllStats = await resp.json();
  return allStats;
}
