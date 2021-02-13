import _ from 'lodash';
import React, {useEffect, useRef, useState} from 'react';
import {PuzzleJson, PuzzleStatsJson, ListPuzzleRequestFilters} from '../../shared/types';
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
}

const NewPuzzleList: React.FC<NewPuzzleListProps> = (props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [fullyLoaded, setFullyLoaded] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const pageSize = 50;
  const [puzzles, setPuzzles] = useState<
    {
      pid: string;
      content: PuzzleJson;
      stats: PuzzleStatsJson;
    }[]
  >([]);
  const fullyScrolled = (): boolean => {
    if (!containerRef.current) return false;
    const {scrollTop, scrollHeight, clientHeight} = containerRef.current;
    const buffer = 600; // 600 pixels of buffer, i guess?
    return scrollTop + clientHeight + buffer > scrollHeight;
  };

  const fetchMore = React.useCallback(
    _.throttle(
      async (
        currentPuzzles: {
          pid: string;
          content: PuzzleJson;
          stats: PuzzleStatsJson;
        }[],
        currentPage: number
      ) => {
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
  }, [JSON.stringify(props.filter)]);

  const handleScroll = async () => {
    if (fullyLoaded) return;
    if (fullyScrolled()) {
      await fetchMore(puzzles, page);
    }
  };
  const handleTouchEnd = async () => {
    console.log('touchend');
    if (containerRef.current) return;
    await handleScroll();
  };

  const puzzleData: {
    entryProps: EntryProps;
  }[] = puzzles
    .map((puzzle) => ({
      entryProps: {
        info: {
          type: puzzle.content.info.type!, // XXX not the best form
        },
        title: puzzle.content.info.title,
        author: puzzle.content.info.author,
        pid: puzzle.pid,
        stats: puzzle.stats,
        status: props.puzzleStatuses[puzzle.pid],
      },
    }))
    .filter((data) => {
      const mappedStatus = {
        undefined: 'New' as const,
        solved: 'Complete' as const,
        started: 'In progress' as const,
      }[data.entryProps.status];
      return props.statusFilter[mappedStatus];
    });
  console.log('Render new puzzle list', puzzles);
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
