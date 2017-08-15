import './grid.css';

import React, { Component } from 'react';
import { isInBounds, isWhite, getParent } from '../gameUtils';

import Cell from './cell';

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

export default class Grid extends Component {
  constructor() {
    super();
  }

  isSelected(r, c) {
    const { grid, selected, direction } = this.props;
    return r === selected.r && c === selected.c;
  }

  isCircled(r, c) {
    const { grid, selected, direction, circles } = this.props;
    const idx = c + r * grid[0].length;
    return (circles || []).indexOf(idx) !== -1;
  }

  isHighlighted(r, c) {
    const { grid, selected, direction } = this.props;
    return !this.isSelected(r, c) && isWhite(grid, r, c) && (
      getParent(grid, selected.r, selected.c, direction)
      === getParent(grid, r, c, direction));
  }

  isReferenced(r, c) {
    return this.props.references.some(clue => (
      this.clueContainsSquare(clue, r, c)
    ));
  }

  handleClick(r, c) {
    if (this.isSelected(r, c)) {
      this.props.onChangeDirection();
    } else {
      this.props.onSetSelected({r, c});
    }
  }

  getAllSquares() {
    let result = [];
    this.props.grid.forEach((row, r) => {
      result = result.concat(row.map((cell, c) => ({
        r: r,
        c: c
      })));
    });
    return result;
  }

  clueContainsSquare({ ori, num }, r, c) {
    const { grid } = this.props;
    return isWhite(grid, r, c) &&
      getParent(grid, r, c, ori) === num;
  }

  render() {
    const size = this.props.size;
    return (
      <table
        style={{
          width: this.props.grid[0].length * this.props.size,
          height: this.props.grid.length * this.props.size
        }}
        className='grid'>
        <tbody>
          {
            this.props.grid.map((row, r) => (
              <tr key={r}>
                {
                  row.map((cell, c) => (
                    <td
                      key={r+'_'+c}
                      className='grid--cell'
                      style={{
                        width: size,
                        height: size,
                        fontSize: size * .15 + 'px',
                      }}
                    >
                      <Cell
                        {...cell}
                        onClick={this.handleClick.bind(this, r, c)}
                        canFlipColor={this.props.canFlipColor}
                        onFlipColor={() => {
                          this.props.onFlipColor && this.props.onFlipColor(r, c);
                        }}
                        selected={this.isSelected(r, c)}
                        referenced={this.isReferenced(r, c)}
                        circled={this.isCircled(r, c)}
                        cursors={(this.props.cursors || []).filter(cursor => cursor.r === r && cursor.c === c)}
                        highlighted={this.isHighlighted(r, c)}
                        myColor={this.props.myColor}
                      />
                    </td>
                  ))
                }
              </tr>
            ))
          }
        </tbody>
      </table>
    )
  }
}


