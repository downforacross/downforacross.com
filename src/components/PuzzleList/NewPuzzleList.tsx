import _ from 'lodash';
import React, {useEffect, useRef, useState} from 'react';
import {PuzzleJson, PuzzleStatsJson, ListPuzzleRequestFilters, ListedPuzzle} from '../../shared/types';
import {fetchPuzzleList} from '../../api/puzzle_list';
import './css/puzzleList.css';
import Entry, {EntryProps} from './Entry';

interface PuzzleStatuses {
  [pid: string]: 'solved' | 'started';
}
interface NewPuzzleListProps {
  filter: ListPuzzleRequestFilters;
  statusFilter: {
    Complete: boolean;
    'In progress': boolean;
    New: boolean;
  };
  puzzleStatuses: PuzzleStatuses;
  uploadedPuzzles: number;
  fencing?: boolean;
}

const summarizePuzzles = (
  puzzles: ListedPuzzle[],
  puzzleStatuses: PuzzleStatuses
): {
  representativePuzzle: ListedPuzzle;
  puzzlesToRender: ListedPuzzle[];
  aggregateStatus: 'solved' | 'started' | undefined;
} => {
  let representativePuzzle;
  let puzzlesToRender;

  const solvedPuzzles = puzzles.filter((p) => puzzleStatuses[p.pid] === 'solved');
  const startedPuzzles = puzzles.filter((p) => puzzleStatuses[p.pid] === 'started');
  let aggregateStatus: 'solved' | 'started' | undefined;
  if (solvedPuzzles.length > 0) {
    // if the user has solved a puzzle instance, use that as the representative puzzle
    representativePuzzle = solvedPuzzles[0];
    puzzlesToRender = puzzles.filter((p) => puzzleStatuses[p.pid]);
    aggregateStatus = 'solved';
  } else if (startedPuzzles.length > 0) {
    // or, if the user has started a puzzle instance, use that as the representative puzzle
    representativePuzzle = startedPuzzles[0];
    puzzlesToRender = puzzles.filter((p) => puzzleStatuses[p.pid]);
    aggregateStatus = 'started';
  } else {
    // otherwise, use the most commonly solved instance
    const mostSolvedPuzzle = _.maxBy(puzzles, (p) => p.stats.numSolves)!;
    representativePuzzle = mostSolvedPuzzle;
    puzzlesToRender = [mostSolvedPuzzle];
  }
  return {representativePuzzle, puzzlesToRender, aggregateStatus};
};

const NewPuzzleList: React.FC<NewPuzzleListProps> = (props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [fullyLoaded, setFullyLoaded] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const pageSize = 50;
  const [puzzles, setPuzzles] = useState<ListedPuzzle[]>([]);
  const fullyScrolled = (): boolean => {
    if (!containerRef.current) return false;
    const {scrollTop, scrollHeight, clientHeight} = containerRef.current;
    const buffer = 600; // 600 pixels of buffer, i guess?
    return scrollTop + clientHeight + buffer > scrollHeight;
  };

  const fetchMore = React.useCallback(
    _.throttle(
      async (currentPuzzles: ListedPuzzle[], currentPage: number) => {
        if (loading) return;
        setLoading(true);
        const nextPage = await fetchPuzzleList({page: currentPage, pageSize, filter: props.filter});
        setPuzzles([...currentPuzzles, ...nextPage.puzzles]);
        setPage(currentPage + 1);
        setLoading(false);
        setFullyLoaded(_.size(nextPage.puzzles) < pageSize);
      },
      500,
      {trailing: true}
    ),
    [loading, JSON.stringify(props.filter)]
  );
  useEffect(() => {
    // it is debatable if we want to blank out the current puzzles here or not,
    // for now we only change the puzzles when the reload happens.
    fetchMore([], 0);
  }, [JSON.stringify(props.filter), props.uploadedPuzzles]);

  const handleScroll = async () => {
    if (fullyLoaded) return;
    if (fullyScrolled()) {
      await fetchMore(puzzles, page);
    }
  };
  const handleTouchEnd = async () => {
    if (containerRef.current) return;
    await handleScroll();
  };

  const puzzleData: {
    entryProps: EntryProps;
  }[] = _.chain(puzzles)
    .groupBy((p) => p.puzzleHash)
    .map((puzzles, _hash) => {
      const {representativePuzzle, aggregateStatus, puzzlesToRender} = summarizePuzzles(
        puzzles,
        props.puzzleStatuses
      );
      return {
        entryProps: {
          info: {
            type: representativePuzzle.content.info.type!, // XXX not the best form
          },
          status: aggregateStatus,
          representativeId: representativePuzzle.pid,
          aggregateStatus: aggregateStatus,
          numSolves: representativePuzzle.stats.numSolves || 0,
          title: representativePuzzle.content.info.title,
          author: representativePuzzle.content.info.author,
          fencing: props.fencing,
          puzzles: puzzlesToRender.map((puzzle) => ({
            pid: puzzle.pid,
            status: props.puzzleStatuses[puzzle.pid],
          })),
        },
      };
    })
    .filter((data) => {
      const statusMapping = {
        solved: 'Complete' as const,
        started: 'In progress' as const,
      };
      let mappedStatus: 'New' | 'Complete' | 'In progress';
      if (data.entryProps.status) {
        mappedStatus = statusMapping[data.entryProps.status];
      } else {
        mappedStatus = 'New';
      }
      return props.statusFilter[mappedStatus];
    })
    .value()
    .sort((p1, p2) => {
      // we sort the results by pid so that scrolling doesn't cause the results to shuffle
      const p1Id = parseInt(p1.entryProps.representativeId);
      const p2Id = parseInt(p2.entryProps.representativeId);
      if (p1Id && p2Id) {
        return p2Id - p1Id;
      }
      return p2.entryProps.representativeId.localeCompare(p1.entryProps.representativeId);
    });
  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        overflowY: 'auto',
      }}
      className="puzzlelist"
      onScroll={handleScroll}
      onTouchEnd={handleTouchEnd}
    >
      {puzzleData.map(({entryProps}, i) => (
        <div className="entry--container" key={i}>
          <Entry {...entryProps} />
        </div>
      ))}
    </div>
  );
};

export default NewPuzzleList;
