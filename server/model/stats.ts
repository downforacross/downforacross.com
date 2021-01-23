import {PuzzleStatsJson} from '@shared/types';

export async function getPuzzleStats(pids: string[]): Promise<PuzzleStatsJson[]> {
  // TODO reflect actual number of solves here.
  return pids.map(() => ({
    numSolves: 1,
  }));
}
