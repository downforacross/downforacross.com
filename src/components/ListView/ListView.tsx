import './css/listView.css';

import _ from 'lodash';
import React, {useEffect, useRef} from 'react';
import GridWrapper from '../../lib/wrappers/GridWrapper';
import {toCellIndex} from '../../shared/types';
import Cell from '../Grid/Cell';
import {GridProps} from '../Grid/Grid';
import {hashGridRow} from '../Grid/hashGridRow';
import {ClueCoords, EnhancedGridData} from '../Grid/types';
import RerenderBoundary from '../RerenderBoundary';
import Clue from '../Player/ClueText';

interface ListViewProps extends GridProps {
  clues: {across: string[]; down: string[]};
  isClueSelected: (dir: 'across' | 'down', i: number) => boolean;
  selectClue: (dir: 'across' | 'down', i: number) => void;
}

type SelectedClue = {
  dir: 'across' | 'down';
  num: number;
};

const ListView: React.FC<ListViewProps> = (props) => {
  const selectedClueRef = useRef<HTMLDivElement>(null);
  const prevSelectedRef = useRef<SelectedClue | null>(null);

  const grid = new GridWrapper(props.grid);
  const opponentGrid = props.opponentGrid && new GridWrapper(props.opponentGrid);

  const selectedIsWhite = grid.isWhite(props.selected.r, props.selected.c);

  useEffect(() => {
    // Find currently selected clue
    let selectedClue: SelectedClue | null = null;

    // Explicitly type the direction to help TypeScript understand
    type Direction = 'across' | 'down';
    const directions: Direction[] = ['across', 'down'];

    directions.forEach((dir) => {
      props.clues[dir].forEach((clue, i) => {
        if (clue && props.isClueSelected(dir, i)) {
          selectedClue = {dir, num: i} as SelectedClue;
        }
      });
    });

    // Only scroll if selected clue changed
    if (
      selectedClue &&
      (!prevSelectedRef.current ||
        prevSelectedRef.current.dir !== (selectedClue as SelectedClue).dir ||
        prevSelectedRef.current.num !== (selectedClue as SelectedClue).num)
    ) {
      const el = selectedClueRef.current;
      if (el) {
        const parent = el.offsetParent as HTMLElement;
        if (parent) {
          parent.scrollTop = el.offsetTop - parent.offsetHeight * 0.2;
        }
      }
      prevSelectedRef.current = selectedClue;
    }
  }); // Run after every render to check for selection changes

  const isSelected = (r: number, c: number, dir: 'across' | 'down' = props.direction) =>
    r === props.selected.r && c === props.selected.c && dir === props.direction;

  const isCircled = (r: number, c: number) => {
    const idx = toCellIndex(r, c, props.grid[0].length);
    return (props.circles || []).indexOf(idx) !== -1;
  };

  const isDoneByOpponent = (r: number, c: number) =>
    !!(
      opponentGrid &&
      props.solution &&
      opponentGrid.isFilled(r, c) &&
      props.solution[r][c] === props.opponentGrid[r][c].value
    );

  const isShaded = (r: number, c: number) => {
    const idx = toCellIndex(r, c, props.grid[0].length);
    return (props.shades || []).indexOf(idx) !== -1 || isDoneByOpponent(r, c);
  };

  const isHighlighted = (r: number, c: number, dir: 'across' | 'down' = props.direction) => {
    if (!selectedIsWhite) return false;
    const selectedParent = grid.getParent(props.selected.r, props.selected.c, props.direction);
    return (
      !isSelected(r, c, dir) &&
      grid.isWhite(r, c) &&
      grid.getParent(r, c, props.direction) === selectedParent &&
      props.direction === dir
    );
  };

  const isReferenced = (r: number, c: number, dir: 'across' | 'down') =>
    props.references.some((clue) => clueContainsSquare(clue, r, c, dir));

  const getPickup = (r: number, c: number) =>
    props.pickups &&
    _.get(
      _.find(props.pickups, ({i, j, pickedUp}) => i === r && j === c && !pickedUp),
      'type'
    );

  const handleClick = (r: number, c: number, dir: 'across' | 'down') => {
    if (!grid.isWhite(r, c) && !props.editMode) return;
    if (dir !== props.direction) {
      props.onChangeDirection();
    }
    props.onSetSelected({r, c});
  };

  const handleRightClick = (r: number, c: number) => {
    props.onPing && props.onPing(r, c);
  };

  const clueContainsSquare = ({ori, num}: ClueCoords, r: number, c: number, dir: 'across' | 'down') =>
    grid.isWhite(r, c) && grid.getParent(r, c, ori) === num && ori === dir;

  const getSizeClass = (size: number) => {
    if (size < 20) return 'tiny';
    if (size < 25) return 'small';
    if (size < 40) return 'medium';
    return 'big';
  };

  const mapGridToClues = () => {
    const cluesCells = {across: [] as EnhancedGridData, down: [] as EnhancedGridData};
    props.grid.forEach((row, r) => {
      row.forEach((cell, c) => {
        const enhancedCell = {
          ...cell,
          r,
          c,
          number: undefined,
          solvedByIconSize: Math.round(props.size / 10),
          selected: false,
          highlighted: false,
          referenced: false,
          circled: isCircled(r, c),
          shaded: isShaded(r, c),
          canFlipColor: !!props.canFlipColor?.(r, c),
          cursors: (props.cursors || []).filter((cursor) => cursor.r === r && cursor.c === c),
          pings: (props.pings || []).filter((ping) => ping.r === r && ping.c === c),
          myColor: props.myColor,
          frozen: props.frozen,
          pickupType: getPickup(r, c),
          cellStyle: props.cellStyle,
        };
        if (_.isNumber(cell.parents?.across)) {
          const acrossIdx = cell.parents?.across as number;
          cluesCells.across[acrossIdx] = cluesCells.across[acrossIdx] || [];
          cluesCells.across[acrossIdx].push({
            ...enhancedCell,
            selected: isSelected(r, c, 'across'),
            highlighted: isHighlighted(r, c, 'across'),
            referenced: isReferenced(r, c, 'across'),
          });
        }
        if (_.isNumber(cell.parents?.down)) {
          const downIdx = cell.parents?.down as number;
          cluesCells.down[downIdx] = cluesCells.down[downIdx] || [];
          cluesCells.down[downIdx].push({
            ...enhancedCell,
            selected: isSelected(r, c, 'down'),
            highlighted: isHighlighted(r, c, 'down'),
            referenced: isReferenced(r, c, 'down'),
          });
        }
      });
    });

    return cluesCells;
  };

  const {size, clues} = props;
  const sizeClass = getSizeClass(size);
  const cluesCells = mapGridToClues();

  return (
    <div className="list-view">
      <div className="list-view--scroll">
        {(['across', 'down'] as const).map((dir, i) => (
          <div className="list-view--list" key={i}>
            <div className="list-view--list--title">{dir.toUpperCase()}</div>
            {clues[dir].map(
              (clue, i) =>
                clue && (
                  <div
                    className="list-view--list--clue"
                    key={i}
                    ref={props.isClueSelected(dir, i) ? selectedClueRef : null}
                    onClick={() => props.selectClue(dir, i)}
                  >
                    <div className="list-view--list--clue--number">{i}</div>
                    <div className="list-view--list--clue--text">
                      <Clue text={clue} />
                    </div>
                    <div className="list-view--list--clue--break" />
                    <div className="list-view--list--clue--grid">
                      <table className={`grid ${sizeClass}`}>
                        <tbody>
                          <RerenderBoundary
                            name={`${dir} clue ${i}`}
                            key={i}
                            hash={hashGridRow(cluesCells[dir][i], {
                              ...props.cellStyle,
                              size: props.size,
                            })}
                          >
                            <tr>
                              {cluesCells[dir][i].map((cellProps) => (
                                <td
                                  key={`${cellProps.r}_${cellProps.c}`}
                                  className="grid--cell"
                                  data-rc={`${cellProps.r} ${cellProps.c}`}
                                  style={{
                                    width: size,
                                    height: size,
                                    fontSize: `${size * 0.15}px`,
                                  }}
                                >
                                  <Cell
                                    {...cellProps}
                                    onClick={(r, c) => handleClick(r, c, dir)}
                                    onContextMenu={handleRightClick}
                                    onFlipColor={props.onFlipColor}
                                  />
                                </td>
                              ))}
                            </tr>
                          </RerenderBoundary>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListView;
