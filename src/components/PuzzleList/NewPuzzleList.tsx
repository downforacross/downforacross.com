import './css/puzzleList.css';
import React, {useRef} from 'react';
import _ from 'lodash';
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
const NewPuzzleList: React.FC<NewPuzzleListProps> = () => {
  const containerRef = useRef<HTMLDivElement>();
  const handlePlay = () => {};
  const handleTouchEnd = () => {};
  const handleScroll = () => {};

  const puzzleData: {
    entryProps: EntryProps;
    status: 'unstarted' | 'started' | 'solved';
  }[] = [];
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
      {puzzleData.map(({entryProps, status}, i) => (
        <div className="entry--container" key={i}>
          <Entry {...entryProps} status={status} onPlay={handlePlay} />
        </div>
      ))}
    </div>
  );
};

export default NewPuzzleList;
