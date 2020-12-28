import {PuzzleStatsJson} from '@shared/types';

export async function getPuzzleStats(pids: string[]): Promise<PuzzleStatsJson[]> {
  return pids.map(() => ({
    numSolves: 1,
  }));
}
