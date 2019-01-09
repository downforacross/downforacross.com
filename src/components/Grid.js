import './css/grid.css';

import React from 'react';
import GridObject from '../utils/Grid';
import Cell from './Cell';

import _ from 'lodash';

/*
 * Summary of Grid component
 *
 * Props: { grid, size, selected, direction, cursors, onSetSelected, onChangeDirection }
 *
 * State: {}
 *
 * Children: [Cell x "n^2"]
 *
 * Potential parents (so far):
 * - Player, Editor
 * - Previewer (TODO)
 **/

export default class Grid extends React.PureComponent {
  get grid() {
    return new GridObject(this.props.grid);
  }

  get opponentGrid() {
    return this.props.opponentGrid && new GridObject(this.props.opponentGrid);
  }

  get selectedIsWhite() {
    const {selected} = this.props;
    return this.grid.isWhite(selected.r, selected.c);
  }

  isSelected(r, c) {
    const {selected} = this.props;
    return r === selected.r && c === selected.c;
  }

  isCircled(r, c) {
    const {grid, circles} = this.props;
    const idx = c + r * grid[0].length;
    return (circles || []).indexOf(idx) !== -1;
  }

  isDoneByOpponent(r, c) {
    if (!this.opponentGrid || !this.props.solution) {
      return false;
    }
    return (
      this.opponentGrid.isFilled(r, c) && this.props.solution[r][c] === this.props.opponentGrid[r][c].value
    );
  }

  isShaded(r, c) {
    const {grid, shades} = this.props;
    const idx = c + r * grid[0].length;
    return (shades || []).indexOf(idx) !== -1 || this.isDoneByOpponent(r, c);
  }

  isHighlighted(r, c) {
    if (!this.selectedIsWhite) return false;
    const {selected, direction} = this.props;
    const selectedParent = this.grid.getParent(selected.r, selected.c, direction);
    return (
      !this.isSelected(r, c) &&
      this.grid.isWhite(r, c) &&
      this.grid.getParent(r, c, direction) === selectedParent
    );
  }

  isReferenced(r, c) {
    return this.props.references.some((clue) => this.clueContainsSquare(clue, r, c));
  }

  getPickup(r, c) {
    return this.props.pickups && _.get(_.find(this.props.pickups, ({i, j}) => i == r && j == c), 'type');
  }

  handleClick(r, c) {
    if (!this.grid.isWhite(r, c) && !this.props.editMode) return;
    if (this.isSelected(r, c)) {
      this.props.onChangeDirection();
    } else {
      this.props.onSetSelected({r, c});
    }
  }

  getAllSquares() {
    return this.grid.keys().map(([r, c]) => ({r, c}));
  }

  clueContainsSquare({ori, num}, r, c) {
    return this.grid.isWhite(r, c) && this.grid.getParent(r, c, ori) === num;
  }

  getSizeClass(size) {
    if (size < 20) {
      return 'tiny';
    } else if (size < 25) {
      return 'small';
    } else if (size < 40) {
      return 'medium';
    } else {
      return 'big';
    }
  }

  render() {
    const size = this.props.size;
    const sizeClass = this.getSizeClass(size);
    const key = size + '-';
    return (
      <table
        style={{
          width: this.props.grid[0].length * this.props.size,
          height: this.props.grid.length * this.props.size,
        }}
        onTouchEnd={(e) => e.stopPropagation()}
        className={'grid ' + sizeClass}
      >
        <tbody>
          {this.props.grid.map((row, r) => (
            <tr key={key + r}>
              {row.map((cell, c) => (
                <td
                  key={r + '_' + c}
                  className="grid--cell"
                  style={{
                    width: size,
                    height: size,
                    fontSize: size * 0.15 + 'px',
                  }}
                >
                  <Cell
                    {...cell}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      this.handleClick(r, c);
                    }}
                    canFlipColor={this.props.canFlipColor && this.props.canFlipColor(r, c)}
                    onFlipColor={() => {
                      this.props.onFlipColor && this.props.onFlipColor(r, c);
                    }}
                    selected={this.isSelected(r, c)}
                    referenced={this.isReferenced(r, c)}
                    circled={this.isCircled(r, c)}
                    shaded={this.isShaded(r, c)}
                    cursors={(this.props.cursors || []).filter((cursor) => cursor.r === r && cursor.c === c)}
                    highlighted={this.isHighlighted(r, c)}
                    myColor={this.props.myColor}
                    pickupType={this.getPickup(r, c)}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
}
