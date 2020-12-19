import './css/puzzleList.css';
import React, {useEffect, useRef} from 'react';
import _, {get, isEmpty} from 'lodash';
import Entry from './Entry';

interface NewPuzzleListProps {}
const NewPuzzleList: React.FC<PuzzleListProps> = (props) => {
  const containerRef = useRef<HTMLDivElement>();
  const handlePlay = () => {};
  const handleTouchEnd = () => {};
  const handleScroll = () => {};

  const puzzleData = [];
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
