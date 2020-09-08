const REMOTE_SERVER =
  process.env.NODE_ENV === 'development' ? 'api-staging.foracross.com' : 'api.foracross.com';
const REMOTE_SERVER_URL = `${window.location.protocol}//${REMOTE_SERVER}`;
if (window.location.protocol === 'https' && process.env.NODE_ENV === 'development') {
  throw new Error('Please use http in development');
}

export const SERVER_URL = process.env.REACT_APP_USE_LOCAL_SERVER
  ? 'http://localhost:3021'
  : REMOTE_SERVER_URL;

// socket.io server is same as api server
export const SOCKET_HOST = SERVER_URL;

// ========== GET /api/stats ============

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
  const json = await resp.json();
  const allStats: AllStats = json;
  return allStats;
}
