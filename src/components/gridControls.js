import './gridControls.css';

import React, { Component } from 'react';

import { isGridFilled, getNextCell, getNextEmptyCell, getNextEmptyCellAfter, hasEmptyCells, isFilled, getCellByNumber, getOppositeDirection, getParent, isInBounds, isWhite, isStartOfClue } from '../gameUtils';

function safe_while(condition, step, cap = 500) {
  while (condition() && cap >= 0) {
    step();
    cap -= 1;
  }
}

export default class GridControls extends Component {
  getSelectedClueNumber() {
    return getParent(this.props.grid, this.props.selected.r, this.props.selected.c, this.props.direction);
  }

  componentDidMount() {
    this.focus();
  }

  isWordFilled(direction, number) {
    const clueRoot = getCellByNumber(this.props.grid, number);
    return !hasEmptyCells(this.props.grid, clueRoot.r, clueRoot.c, direction);
  }

  selectNextClue(backwards) {
    let clueNumber = this.getSelectedClueNumber();
    let direction = this.props.direction;
    const add = backwards ? -1 : 1;
    const start = () => backwards ? (this.props.clues[direction].length - 1) : 1;
    const step = () => {
      if (clueNumber + add < this.props.clues[direction].length && clueNumber + add >= 0) {
        clueNumber += add;
      } else {
        direction = getOppositeDirection(direction);
        clueNumber = start();
      }
    };
    const ok = () => {
      return this.props.clues[direction][clueNumber] !== undefined && (this.isGridFilled() || !this.isWordFilled(direction, clueNumber));
    };
    step();

    safe_while(() => !ok(), step);
    this.selectClue(direction, clueNumber);
  }

  selectClue(direction, number) {
    this.setDirection(direction);
    const clueRoot = getCellByNumber(this.props.grid, number);
    const firstEmptyCell = getNextEmptyCell(this.props.grid, clueRoot.r, clueRoot.c, direction);
    this.setSelected(firstEmptyCell || clueRoot);
  }

  handleKeyDown(ev) {
    if (ev.target.tagName === 'INPUT') {
      return;
    }
    const moveSelectedBy = (dr, dc) => () => {
      const { grid } = this.props;
      const { selected, direction } = this.props;
      let { r, c } = selected;
      const step = () => {
        r += dr;
        c += dc;
      };
      step();
      safe_while(() => (
        isInBounds(grid, r, c)
        && !isWhite(grid, r, c)
      ), step);
      if (isInBounds(grid, r, c)) {
        this.setSelected({ r, c });
      }
    };

    const setDirection = (direction, cbk) => () => {
      if (this.props.direction !== direction) {
        if (this.canSetDirection(direction)) {
          this.setDirection(direction);
        } else {
          cbk();
        }
      } else {
        cbk();
      }
    }

    const movement = {
      'ArrowLeft': setDirection('across', moveSelectedBy(0, -1)),
      'ArrowUp': setDirection('down', moveSelectedBy(-1, 0)),
      'ArrowDown': setDirection('down', moveSelectedBy(1, 0)),
      'ArrowRight': setDirection('across', moveSelectedBy(0, 1)),
      'Backspace': this.backspace.bind(this),
      'Tab': this.selectNextClue.bind(this),
    };

    if (ev.key in movement) {
      ev.preventDefault();
      ev.stopPropagation();
      movement[ev.key](ev.shiftKey);
    } else if (ev.key === 'Enter') {
      this.props.onEnter && this.props.onEnter();
    } else {
      const letter = ev.key.toUpperCase();
      if (!ev.metaKey && !ev.ctrlKey && letter.match(/^[A-Z0-9]$/)) {
        ev.preventDefault();
        ev.stopPropagation();
        this.typeLetter(letter, ev.shiftKey);
      }
    }
  }

  goToNextEmptyCell() {
    let { r, c } = this.props.selected;
    const nextEmptyCell = getNextEmptyCellAfter(this.props.grid, r, c, this.props.direction);
    if (nextEmptyCell) {
      this.setSelected(nextEmptyCell);
      return nextEmptyCell;
    } else {
      const nextCell = getNextCell(this.props.grid, r, c, this.props.direction);
      if (nextCell) {
        this.setSelected(nextCell);
        return nextCell;
      }
    }
  }

  goToPreviousCell() {
    let { r, c } = this.props.selected;
    const grid = this.props.grid;
    const step = () => {
      if (this.props.direction === 'across') {
        if (c > 0) {
          c--;
        } else {
          c = grid[0].length - 1;
          r--;
        }
      } else {
        if (r > 0) {
          r--;
        } else {
          r = grid.length - 1;
          c--;
        }
      }
    };
    const ok = () => {
      return isInBounds(grid, r, c) && isWhite(grid, r, c);
    };
    step();
    safe_while(() => (
      isInBounds(grid, r, c) && !ok()
    ), step);
    if (ok()) {
      this.setSelected({ r, c });
      return { r, c };
    }
  }


  typeLetter(letter, isRebus) {
    const { r, c } = this.props.selected;
    const value = this.props.grid[r][c].value;
    this.props.updateGrid(r, c, isRebus ? ((value || '').substr(0, 10) + letter) : letter);
    if (!isRebus) {
      this.goToNextEmptyCell();
    }
  }

  backspace(shouldStay) {
    let { r, c } = this.props.selected;
    if (this.props.grid[r][c].value !== '') {
      this.props.updateGrid(r, c, '');
    } else {
      if (!shouldStay) {
        const cell = this.goToPreviousCell();
        if (cell) {
          this.props.updateGrid(cell.r, cell.c, '');
        }
      }
    }
  }

  isGridFilled() {
    return isGridFilled(this.props.grid);
  }

  setDirection(direction) {
    this.props.onSetDirection(direction);
  }

  canSetDirection(direction) {
    return this.props.canSetDirection(direction);
  }

  setSelected(selected) {
    this.props.onSetSelected(selected);
  }

  focus() {
    this.refs.gridControls.focus();
  }

  render() {
    return <div
      ref='gridControls'
      className='grid-controls'
      tabIndex='1'
      onKeyDown={this.handleKeyDown.bind(this)} >
      <div className='grid--content'>
        {this.props.children}
        <div className='grid--cover'>
          out of focus
        </div>
      </div>
    </div>
  }
}
