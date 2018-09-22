import './css/gridControls.css';

import React, { Component } from 'react';

import GridObject from '../utils/Grid';
import * as gameUtils from '../gameUtils';

function safe_while(condition, step, cap = 500) {
  while (condition() && cap >= 0) {
    step();
    cap -= 1;
  }
}

export default class GridControls extends Component {

  get grid() {
    return new GridObject(this.props.grid);
  }

  getSelectedClueNumber() {
    return this.grid.getParent(this.props.selected.r, this.props.selected.c, this.props.direction);
  }

  componentDidMount() {
    this.focus();
  }

  isWordFilled(direction, number) {
    const clueRoot = this.grid.getCellByNumber(number);
    return !this.grid.hasEmptyCells(clueRoot.r, clueRoot.c, direction);
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
        direction = gameUtils.getOppositeDirection(direction);
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
    const clueRoot = this.grid.getCellByNumber(number);
    const firstEmptyCell = this.grid.getNextEmptyCell(clueRoot.r, clueRoot.c, direction);
    this.setSelected(firstEmptyCell || clueRoot);
  }

  isSelectable(r, c) {
    return this.props.editMode || this.grid.isWhite(r, c);
  }

  // factored out handleAction for mobileGridControls
  handleAction(action, shiftKey) {
    const moveSelectedBy = (dr, dc) => () => {
      const { selected } = this.props;
      let { r, c } = selected;
      const step = () => {
        r += dr;
        c += dc;
      };
      step();
      safe_while(() => (
        this.grid.isInBounds(r, c)
        && !this.isSelectable(r, c)      ), step);
      if (this.grid.isInBounds(r, c)) {
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

    const flipDirection = () => {
      if (this.props.direction === 'across') {
        if (this.canSetDirection('down')) {
            this.setDirection('down');
        }
      } else {
        if (this.canSetDirection('across')) {
            this.setDirection('across');
        }
      }
    }

    const actions = {
      'left': setDirection('across', moveSelectedBy(0, -1)),
      'up': setDirection('down', moveSelectedBy(-1, 0)),
      'down': setDirection('down', moveSelectedBy(1, 0)),
      'right': setDirection('across', moveSelectedBy(0, 1)),
      'backspace': this.backspace.bind(this),
      'delete': this.delete.bind(this),
      'tab': this.selectNextClue.bind(this),
      'space': flipDirection,
    };

    if (!(action in actions)) {
      console.error('illegal action', action);
      return; // weird!
    }
    actions[action](shiftKey);
  }

  validLetter(letter) {
    const VALID_SYMBOLS = '!@#$%^&*()-+=`~/?\\'; // special theme puzzles have these sometimes;
    if (VALID_SYMBOLS.indexOf(letter) !== -1) return true;
    return letter.match(/^[A-Z0-9]$/);
  }


  handleKeyDown(ev) {
    if (ev.target.tagName === 'INPUT') {
      return;
    }

    const actionKeys = {
      'ArrowLeft': 'left',
      'ArrowUp': 'up',
      'ArrowDown': 'down',
      'ArrowRight': 'right',
      'Backspace': 'backspace',
      'Delete': 'delete',
      'Tab': 'tab',
      ' ': 'space',
    };

    const { onPressEnter, onPressPeriod, onPressEscape } = this.props;
    if (ev.key in actionKeys) {
      ev.preventDefault();
      ev.stopPropagation();
      this.handleAction(actionKeys[ev.key], ev.shiftKey);
    } else if (ev.key === '.') {
      ev.preventDefault();
      ev.stopPropagation();
      onPressPeriod && onPressPeriod();
    } else if (ev.key === 'Enter') {
      ev.preventDefault();
      ev.stopPropagation();
      onPressEnter && onPressEnter();
    } else if (ev.key === 'Escape') {
      onPressEscape && onPressEscape();
    } else {
      const letter = ev.key.toUpperCase();
      if (this.props.frozen) return;
      if (!ev.metaKey && !ev.ctrlKey && this.validLetter(letter)) {
        ev.preventDefault();
        ev.stopPropagation();
        this.typeLetter(letter, ev.shiftKey);
      }
    }
  }

  goToNextEmptyCell() {
    let { r, c } = this.props.selected;
    const nextEmptyCell = this.grid.getNextEmptyCell(r, c, this.props.direction, {
      skipFirst: true
    });
    if (nextEmptyCell) {
      this.setSelected(nextEmptyCell);
      return nextEmptyCell;
    } else {
      const nextCell = this.grid.getNextCell(r, c, this.props.direction);
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
      return this.grid.isInBounds(r, c) && this.grid.isWhite(r, c);
    };
    step();
    safe_while(() => (
      this.grid.isInBounds(r, c) && !ok()
    ), step);
    if (ok()) {
      this.setSelected({ r, c });
      return { r, c };
    }
  }

  typeLetter(letter, isRebus) {
    const { r, c } = this.props.selected;
    const value = this.props.grid[r][c].value;
    if (!isRebus) {
      this.goToNextEmptyCell();
    }
    this.props.updateGrid(r, c, isRebus ? ((value || '').substr(0, 10) + letter) : letter);
  }

  // Returns true if the letter was successfully deleted
  delete() {
    let { r, c } = this.props.selected;
    if (this.props.grid[r][c].value !== '' && !this.props.grid[r][c].good) {
      this.props.updateGrid(r, c, '');
      return true;
    }
    return false;
  }

  backspace(shouldStay) {
    if (!this.delete() && !shouldStay){
      const cell = this.goToPreviousCell();
      if (cell) {
        this.props.updateGrid(cell.r, cell.c, '');
      }
    }
  }

  isGridFilled() {
    return this.grid.isGridFilled();
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
      </div>
    </div>
  }
}
