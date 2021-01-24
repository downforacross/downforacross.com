import {PuzzleStatsJson} from '@shared/types';
import {pool} from './pool';

interface SolveCount {
  numSolves: number;
  pid: string;
}
export async function getPuzzleStats(pids: string[]): Promise<PuzzleStatsJson[]> {
  const startTime = Date.now();
  const {rows} = await pool.query(
    `
      SELECT 
             count(*) as numSolves,
             pid
      FROM puzzle_solves
      WHERE pid = ANY($1)
      GROUP BY pid
    `,
    [pids]
  );
  const solveCounts: SolveCount[] = rows;
  const countsByPid = new Map<string, number>();
  for (const value of solveCounts) {
    countsByPid.set(value.pid, value.numSolves);
  }
  const puzzleStatsJsonArray = pids.map((pid) => {
    return {numSolves: countsByPid.get(pid) || 0};
  });
  const ms = Date.now() - startTime;
  console.log(`getPuzzleStats (${pids}) took ${ms}ms`);
  return puzzleStatsJsonArray;
}
