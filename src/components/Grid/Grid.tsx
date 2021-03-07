import './css/index.css';

import React from 'react';
import _ from 'lodash';
import GridWrapper from '../../lib/wrappers/GridWrapper';
import RerenderBoundary from '../RerenderBoundary';
import {hashGridRow} from './hashGridRow';
import Cell from './Cell';
import {
  GridDataWithColor,
  CellCoords,
  CellIndex,
  ClueCoords,
  BattlePickup,
  toCellIndex,
  CellStyles,
  Ping,
} from './types';
import {Cursor, GridData} from '../../shared/types';

interface GridProps {
  // Grid data
  solution: string[][];
  grid: GridDataWithColor;
  opponentGrid: GridData;

  // Cursor state
  selected: CellCoords;
  direction: 'across' | 'down';

  // Cell annotations
  circles?: CellIndex[];
  shades?: CellIndex[];
  pings?: Ping[];
  cursors: Cursor[];

  // Styles & related
  references: ClueCoords[];
  pickups?: BattlePickup[];
  cellStyle: CellStyles;
  myColor: string;

  // Edit modes
  size: number;
  editMode: boolean;
  frozen: boolean;

  // callbacks
  onChangeDirection(): void;
  onSetSelected(cellCoords: CellCoords): void;
  onPing?(r: number, c: number): void;
  canFlipColor?(r: number, c: number): boolean;
  onFlipColor?(r: number, c: number): void;
}

export default class Grid extends React.PureComponent<GridProps> {
  get grid() {
    return new GridWrapper(this.props.grid);
  }

  get opponentGrid() {
    return this.props.opponentGrid && new GridWrapper(this.props.opponentGrid);
  }

  get selectedIsWhite() {
    const {selected} = this.props;
    return this.grid.isWhite(selected.r, selected.c);
  }

  isSelected(r: number, c: number) {
    const {selected} = this.props;
    return r === selected.r && c === selected.c;
  }

  isCircled(r: number, c: number) {
    const {grid, circles} = this.props;
    const idx = toCellIndex(r, c, grid.length);
    return (circles || []).indexOf(idx) !== -1;
  }

  isDoneByOpponent(r: number, c: number) {
    if (!this.opponentGrid || !this.props.solution) {
      return false;
    }
    return (
      this.opponentGrid.isFilled(r, c) && this.props.solution[r][c] === this.props.opponentGrid[r][c].value
    );
  }

  isShaded(r: number, c: number) {
    const {grid, shades} = this.props;
    const idx = toCellIndex(r, c, grid[0].length);
    return (shades || []).indexOf(idx) !== -1 || this.isDoneByOpponent(r, c);
  }

  isHighlighted(r: number, c: number) {
    if (!this.selectedIsWhite) return false;
    const {selected, direction} = this.props;
    const selectedParent = this.grid.getParent(selected.r, selected.c, direction);
    return (
      !this.isSelected(r, c) &&
      this.grid.isWhite(r, c) &&
      this.grid.getParent(r, c, direction) === selectedParent
    );
  }

  isReferenced(r: number, c: number) {
    return this.props.references.some((clue) => this.clueContainsSquare(clue, r, c));
  }

  getPickup(r: number, c: number) {
    return (
      this.props.pickups &&
      _.get(
        _.find(this.props.pickups, ({i, j, pickedUp}) => i === r && j === c && !pickedUp),
        'type'
      )
    );
  }

  handleClick = (r: number, c: number) => {
    if (!this.grid.isWhite(r, c) && !this.props.editMode) return;
    if (this.isSelected(r, c)) {
      this.props.onChangeDirection();
    } else {
      this.props.onSetSelected({r, c});
    }
  };

  handleRightClick = (r: number, c: number) => {
    this.props.onPing && this.props.onPing(r, c);
  };

  getAllSquares() {
    return this.grid.keys().map(([r, c]) => ({r, c}));
  }

  clueContainsSquare({ori, num}: ClueCoords, r: number, c: number) {
    return this.grid.isWhite(r, c) && this.grid.getParent(r, c, ori) === num;
  }

  getSizeClass(size: number) {
    if (size < 20) {
      return 'tiny';
    }
    if (size < 25) {
      return 'small';
    }
    if (size < 40) {
      return 'medium';
    }
    return 'big';
  }

  render() {
    const {size, cellStyle} = this.props;
    const sizeClass = this.getSizeClass(size);

    const data = this.props.grid.map((row, r) =>
      row.map((cell, c) => ({
        ...cell,
        r,
        c,
        solvedByIconSize: Math.round(size / 10),
        selected: this.isSelected(r, c),
        referenced: this.isReferenced(r, c),
        circled: this.isCircled(r, c),
        shaded: this.isShaded(r, c),
        canFlipColor: !!this.props.canFlipColor?.(r, c),
        cursors: (this.props.cursors || []).filter((cursor) => cursor.r === r && cursor.c === c),
        pings: (this.props.pings || []).filter((ping) => ping.r === r && ping.c === c),
        highlighted: this.isHighlighted(r, c),
        myColor: this.props.myColor,
        frozen: this.props.frozen,
        pickupType: this.getPickup(r, c),
        cellStyle,
      }))
    );
    return (
      <table
        style={{
          width: this.props.grid[0].length * this.props.size,
          height: this.props.grid.length * this.props.size,
        }}
        className={`grid ${sizeClass}`}
      >
        <tbody>
          {data.map((row, i) => (
            <RerenderBoundary key={i} hash={hashGridRow(row, {...this.props.cellStyle, size})}>
              <tr>
                {row.map((cellProps) => (
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
                      onClick={this.handleClick}
                      onContextMenu={this.handleRightClick}
                      onFlipColor={this.props.onFlipColor}
                    />
                  </td>
                ))}
              </tr>
            </RerenderBoundary>
          ))}
        </tbody>
      </table>
    );
  }
}
