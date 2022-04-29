/* eslint react/no-string-refs: "warn", no-plusplus: "off" */
import './css/gridControls.css';

import React, {Component} from 'react';

import GridObject from '../../lib/wrappers/GridWrapper';

function safe_while(condition, step, cap = 500) {
  while (condition() && cap >= 0) {
    step();
    cap -= 1;
  }
}

export default class GridControls extends Component {
  actions = {
    left: this.setDirectionWithCallback('across', this.moveSelectedBy(0, -1).bind(this)).bind(this),
    up: this.setDirectionWithCallback('down', this.moveSelectedBy(-1, 0).bind(this)).bind(this),
    down: this.setDirectionWithCallback('down', this.moveSelectedBy(1, 0).bind(this)).bind(this),
    right: this.setDirectionWithCallback('across', this.moveSelectedBy(0, 1).bind(this)).bind(this),
    forward: this.moveSelectedUsingDirection(1).bind(this),
    backward: this.moveSelectedUsingDirection(-1).bind(this),
    home: this.moveToEdge(true).bind(this),
    end: this.moveToEdge(false).bind(this),
    backspace: this.backspace.bind(this),
    delete: this.delete.bind(this),
    tab: this.selectNextClue.bind(this),
    space: this.flipDirection.bind(this),
  };

  get grid() {
    return new GridObject(this.props.grid);
  }

  getSelectedClueNumber() {
    return this.grid.getParent(this.props.selected.r, this.props.selected.c, this.props.direction);
  }

  componentDidMount() {
    this.focus();
  }

  selectNextClue(backwards, parallel = false) {
    const {direction, clueNumber} = this.grid.getNextClue(
      this.getSelectedClueNumber(),
      this.props.direction,
      this.props.clues,
      backwards,
      parallel
    );

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

  flipDirection() {
    if (this.props.direction === 'across') {
      if (this.canSetDirection('down')) {
        this.setDirection('down');
      }
    } else if (this.canSetDirection('across')) {
      this.setDirection('across');
    }
  }

  moveSelectedBy(dr, dc) {
    return () => {
      const {selected} = this.props;
      let {r, c} = selected;
      const step = () => {
        r += dr;
        c += dc;
      };
      step();
      safe_while(() => this.grid.isInBounds(r, c) && !this.isSelectable(r, c), step);
      if (this.grid.isInBounds(r, c)) {
        this.setSelected({r, c});
      }
    };
  }

  moveSelectedUsingDirection(d) {
    return () => {
      const [dr, dc] = this.props.direction === 'down' ? [0, d] : [d, 0];
      return this.moveSelectedBy(dr, dc)();
    };
  }

  moveToEdge(start) {
    return () => {
      const {selected, direction} = this.props;
      let {r, c} = selected;
      ({r, c} = this.grid.getEdge(r, c, direction, start));
      if (this.grid.isInBounds(r, c)) {
        this.setSelected({r, c});
      }
    };
  }

  setDirectionWithCallback(direction, cbk) {
    return () => {
      if (this.props.direction !== direction) {
        if (this.canSetDirection(direction)) {
          this.setDirection(direction);
        } else {
          cbk();
        }
      } else {
        cbk();
      }
    };
  }

  // factored out handleAction for mobileGridControls
  handleAction(action, shiftKey) {
    if (!(action in this.actions)) {
      console.error('illegal action', action);
      return; // weird!
    }
    this.actions[action](shiftKey);
  }

  handleAltKey(key, shiftKey) {
    key = key.toLowerCase();
    const altAction = shiftKey ? this.props.onReveal : this.props.onCheck;
    if (key === 's') {
      altAction('square');
    }
    if (key === 'w') {
      altAction('word');
    }
    if (key === 'p') {
      altAction('puzzle');
    }
  }

  validLetter(letter) {
    const VALID_SYMBOLS = '!@#$%^&*()-+=`~/?\\'; // special theme puzzles have these sometimes;
    if (VALID_SYMBOLS.indexOf(letter) !== -1) return true;
    return letter.match(/^[A-Z0-9]$/);
  }

  // takes in key, a string
  _handleKeyDown = (key, shiftKey, altKey) => {
    const actionKeys = {
      ArrowLeft: 'left',
      ArrowUp: 'up',
      ArrowDown: 'down',
      ArrowRight: 'right',
      Backspace: 'backspace',
      '{del}': 'backspace',
      Delete: 'delete',
      Tab: 'tab',
      ' ': 'space',
      '[': 'backward',
      ']': 'forward',
      Home: 'home',
      End: 'end',
    };

    if (shiftKey) {
      const isAcross = this.props.direction === 'across';
      actionKeys[isAcross ? 'ArrowUp' : 'ArrowLeft'] = 'backward';
      actionKeys[isAcross ? 'ArrowDown' : 'ArrowRight'] = 'forward';
    }

    const {onPressEnter, onPressPeriod, onPressEscape} = this.props;
    if (key in actionKeys) {
      this.handleAction(actionKeys[key], shiftKey);
      return true;
    }
    if (key === '.') {
      onPressPeriod && onPressPeriod();
      return true;
    }
    if (key === 'Enter') {
      onPressEnter && onPressEnter();
      return true;
    }
    if (altKey) {
      this.handleAltKey(key, shiftKey);
      return true;
    }
    if (key === 'Escape') {
      onPressEscape && onPressEscape();
    } else if (!this.props.frozen) {
      const letter = key.toUpperCase();
      if (this.validLetter(letter)) {
        this.typeLetter(letter, shiftKey);
        return true;
      }
    }
  };

  _handleKeyDownVim = (key, shiftKey, altKey) => {
    const actionKeys = {
      ArrowLeft: 'left',
      ArrowUp: 'up',
      ArrowDown: 'down',
      ArrowRight: 'right',
      Backspace: 'backspace',
      '{del}': 'backspace',
      Delete: 'delete',
      Tab: 'tab',
      ' ': 'space',
      '[': 'backward',
      ']': 'forward',
      Home: 'home',
      End: 'end',
    };

    const normalModeActionKeys = {
      h: 'left',
      j: 'down',
      k: 'up',
      l: 'right',
      x: 'delete',
      '^': 'home',
      '$': 'end',
    };

    const {onVimNormal, onVimInsert, vimInsert, onPressEnter, onPressPeriod} = this.props;
    if (key in actionKeys) {
      this.handleAction(actionKeys[key], shiftKey);
      return true;
    }
    if (altKey) {
      this.handleAltKey(key, shiftKey);
      return true;
    }
    if (!vimInsert) {
      if (key in normalModeActionKeys) {
        this.handleAction(normalModeActionKeys[key], shiftKey);
      } else if (key === 'w') {
        this.selectNextClue(false);
      } else if (key === 'b') {
        this.selectNextClue(true);
      } else if (key === 'i') {
        onVimInsert && onVimInsert();
      } else if (key === 's') {
        this.delete();
        onVimInsert && onVimInsert();
      }
    } else if (key === '.') {
      onPressPeriod && onPressPeriod();
      return true;
    } else if (key === 'Enter') {
      onPressEnter && onPressEnter();
      return true;
    } else if (key === 'Escape') {
      onVimNormal && onVimNormal();
    } else if (vimInsert && !this.props.frozen) {
      const letter = key.toUpperCase();
      if (this.validLetter(letter)) {
        this.typeLetter(letter, shiftKey);
        return true;
      }
    }
  };

  // takes in a Keyboard Event
  handleKeyDown(ev) {
    const {vimMode} = this.props;
    const _handleKeyDown = vimMode ? this._handleKeyDownVim : this._handleKeyDown;

    if (ev.target.tagName === 'INPUT' || ev.metaKey || ev.ctrlKey) {
      return;
    }
    if (_handleKeyDown(ev.key, ev.shiftKey, ev.altKey)) {
      ev.preventDefault();
      ev.stopPropagation();
    }
  }

  goToNextEmptyCell({nextClueIfFilled = false} = {}) {
    const {r, c} = this.props.selected;
    const nextEmptyCell = this.grid.getNextEmptyCell(r, c, this.props.direction, {
      skipFirst: true,
    });
    if (nextEmptyCell) {
      this.setSelected(nextEmptyCell);
      return nextEmptyCell;
    }
    const nextCell = this.grid.getNextCell(r, c, this.props.direction);
    if (nextCell) {
      this.setSelected(nextCell);
      return nextCell;
    }
    if (nextClueIfFilled) {
      this.selectNextClue();
    }
  }

  goToPreviousCell() {
    let {r, c} = this.props.selected;
    const grid = this.props.grid;
    const step = () => {
      if (this.props.direction === 'across') {
        if (c > 0) {
          c--;
        } else {
          c = grid[0].length - 1;
          r--;
        }
      } else if (r > 0) {
        r--;
      } else {
        r = grid.length - 1;
        c--;
      }
    };
    const ok = () => this.grid.isInBounds(r, c) && this.grid.isWhite(r, c);
    step();
    safe_while(() => this.grid.isInBounds(r, c) && !ok(), step);
    if (ok()) {
      this.setSelected({r, c});
      return {r, c};
    }
  }

  typeLetter(letter, isRebus, {nextClueIfFilled} = {}) {
    if (this.props.beta) {
      return this.typeLetterSync(letter, isRebus, {nextClueIfFilled});
    }
    if (!this.nextTime) this.nextTime = Date.now();
    setTimeout(() => {
      if (letter === '/') isRebus = true;
      const {r, c} = this.props.selected;
      const value = this.props.grid[r][c].value;
      if (!isRebus) {
        this.goToNextEmptyCell({nextClueIfFilled});
      }
      this.props.updateGrid(r, c, isRebus ? (value || '').substr(0, 10) + letter : letter);
    }, Math.max(0, this.nextTime - Date.now()));
    this.nextTime = Math.max(this.nextTime, Date.now()) + 30;
  }

  typeLetterSync(letter, isRebus, {nextClueIfFilled} = {}) {
    if (letter === '/') isRebus = true;
    const {r, c} = this.props.selected;
    const value = this.props.grid[r][c].value;
    if (!isRebus) {
      this.goToNextEmptyCell({nextClueIfFilled});
    }
    this.props.updateGrid(r, c, isRebus ? (value || '').substr(0, 10) + letter : letter);
  }

  // Returns true if the letter was successfully deleted
  delete() {
    const {r, c} = this.props.selected;
    if (this.props.grid[r][c].value !== '' && !this.props.grid[r][c].good) {
      this.props.updateGrid(r, c, '');
      return true;
    }
    return false;
  }

  backspace(shouldStay) {
    if (!this.delete() && !shouldStay) {
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
    return (
      <div
        ref="gridControls"
        className="grid-controls"
        tabIndex="1"
        onKeyDown={this.handleKeyDown.bind(this)}
      >
        <div className="grid--content">{this.props.children}</div>
      </div>
    );
  }
}
