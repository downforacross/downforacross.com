import {PuzzleJson, PuzzleStatsJson} from '@shared/types';
import _ from 'lodash';
import React, {useRef, useState} from 'react';
import {useMount} from 'react-use';
import {fetchPuzzleList} from '../../api/puzzle_list';
import './css/puzzleList.css';
import Entry from './Entry';
interface NewPuzzleListProps {}

// TODO move to Entry.tsx
interface EntryProps {
  info: {
    type: string;
  };
  title: string;
  author: string;
  pid: string;
  status: string;
  stats: {
    numSolves: number;
  };
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
  const fetchMore = async () => {
    if (loading) return;
    setLoading(true);
    const nextPage = await fetchPuzzleList({page, pageSize});
    setPuzzles([...puzzles, ...nextPage.puzzles]);
    setPage(page + 1);
    setLoading(false);
    setFullyLoaded(_.size(nextPage.puzzles) < pageSize);
  };

  useMount(fetchMore);
  const handlePlay = () => {};
  const handleTouchEnd = () => {};
  const handleScroll = () => {
    if (fullyLoaded) return;
    // TODO fetch more if last puzzles are visible
  };

  const puzzleData: {
    entryProps: EntryProps;
  }[] = puzzles.map((puzzle) => ({
    entryProps: {
      info: {
        type: puzzle.content.info.type!, // XXX not the best form
      },
      title: puzzle.content.info.title,
      author: puzzle.content.info.author,
      pid: puzzle.pid,
      stats: puzzle.stats,
      status: 'unstarted',
    },
  }));
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
          <Entry {...entryProps} onPlay={handlePlay} />
        </div>
      ))}
    </div>
  );
};

export default NewPuzzleList;
