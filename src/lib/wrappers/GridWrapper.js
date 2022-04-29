/* eslint no-continue: "off", no-underscore-dangle: "off" */
import _ from 'lodash';
// eslint-disable-next-line import/no-cycle
import * as gameUtils from '../gameUtils';

function safe_while(condition, step, cap = 500) {
  while (condition() && cap >= 0) {
    step();
    cap -= 1;
  }
}

export default class GridWrapper {
  constructor(grid) {
    this.grid = grid;
    if (!grid) {
      throw new Error('Attempting to wrap an undefined grid object.');
    }
    if (!_.isArray(grid)) {
      throw new Error(`Invalid type for grid object: ${typeof grid}`);
    }
  }

  get clueLengths() {
    const result = {
      across: [],
      down: [],
    };
    this.values().forEach((cell) => {
      if (cell && !cell.black) {
        ['across', 'down'].forEach((dir) => {
          result[dir][cell.parents[dir]] = (result[dir][cell.parents[dir]] || 0) + 1;
        });
      }
    });
    return result;
  }

  get size() {
    return this.grid.length;
  }

  get rows() {
    return this.grid.length;
  }

  get cols() {
    return this.grid[0].length;
  }

  keys() {
    const keys = [];
    for (const r of _.range(0, this.grid.length)) {
      for (const c of _.range(0, this.grid[r].length)) {
        keys.push([r, c]);
      }
    }
    return keys;
  }

  values() {
    const values = [];
    for (const r of _.range(0, this.grid.length)) {
      for (const c of _.range(0, this.grid[r].length)) {
        values.push(this.grid[r][c]);
      }
    }
    return values;
  }

  items() {
    const items = [];
    for (const r of _.range(0, this.grid.length)) {
      for (const c of _.range(0, this.grid[r].length)) {
        items.push([r, c, this.grid[r][c]]);
      }
    }
    return items;
  }

  isSolved(solution) {
    for (const [r, c, cell] of this.items()) {
      if (solution[r][c] !== '.' && solution[r][c] !== cell.value) {
        return false;
      }
    }
    return true;
  }

  isGridFilled() {
    for (const cell of this.values()) {
      if (!cell.black && cell.value === '') {
        return false;
      }
    }
    return true;
  }

  getNextCell(r, c, direction) {
    if (direction === 'across') {
      c += 1;
    } else {
      r += 1;
    }
    if (this.isWriteable(r, c)) {
      return {r, c};
    }
    return undefined;
  }

  getPreviousCell(r, c, direction) {
    if (direction === 'across') {
      c -= 1;
    } else {
      r -= 1;
    }
    if (this.isWriteable(r, c)) {
      return {r, c};
    }
    return undefined;
  }

  getEdge(r, c, direction, start = true) {
    let dr = 0;
    let dc = 0;

    if (direction === 'across') {
      dc = -1;
    } else {
      dr = -1;
    }
    if (!start) {
      dc = -dc;
      dr = -dr;
    }

    do {
      c += dc;
      r += dr;
    } while (this.isWriteable(r, c));
    c -= dc;
    r -= dr;

    return {r, c};
  }

  getNextEmptyCell(r, c, direction, options = {}) {
    const _r = r;
    const _c = c;
    let {noWraparound = false, skipFirst = false} = options;

    while (this.isWriteable(r, c)) {
      if (!this.isFilled(r, c)) {
        if (!skipFirst) {
          return {r, c};
        }
      }
      skipFirst = false;
      if (direction === 'across') {
        c += 1;
      } else {
        r += 1;
      }
    }

    if (!noWraparound) {
      ({r, c} = this.getEdge(r, c, direction));

      // recurse but not infinitely
      const result = this.getNextEmptyCell(r, c, direction, {
        noWraparound: true,
      });
      if (!result || (result.r === _r && result.c === _c)) return undefined;
      return result;
    }
    return undefined;
  }

  hasEmptyCells(r, c, direction) {
    return this.getNextEmptyCell(r, c, direction) !== undefined;
  }

  isWordFilled(direction, number) {
    const clueRoot = this.getCellByNumber(number);
    return !this.hasEmptyCells(clueRoot.r, clueRoot.c, direction);
  }

  getNextClue(clueNumber, direction, clues, backwards, parallel) {
    clueNumber = parallel ? this.parallelMap[direction][clueNumber] : clueNumber;
    const add = backwards ? -1 : 1;
    const start = () => (backwards ? clues[direction].length - 1 : 1);
    const step = () => {
      if (clueNumber + add < clues[direction].length && clueNumber + add >= 0) {
        clueNumber += add;
      } else {
        direction = gameUtils.getOppositeDirection(direction);
        clueNumber = start();
      }
    };
    const ok = () => {
      const number = parallel ? this.parallelMapInverse[direction][clueNumber] : clueNumber;
      return (
        clues[direction][number] !== undefined &&
        (this.isGridFilled() || !this.isWordFilled(direction, number))
      );
    };
    step();

    safe_while(() => !ok(), step);
    const number = parallel ? this.parallelMapInverse[direction][clueNumber] : clueNumber;
    return {
      direction,
      clueNumber: number,
    };
  }

  getWritableLocations() {
    const writableLocations = [];

    _.forEach(_.range(this.grid.length), (i) => {
      _.forEach(_.range(this.grid[0].length), (j) => {
        if (this.isWriteable(i, j)) {
          writableLocations.push({i, j});
        }
      });
    });

    return writableLocations;
  }

  getCrossingWords(r, c) {
    const writableLocations = this.getWritableLocations();
    const isSameWord = (direction) => ({i, j}) =>
      this.getParent(r, c, direction) === this.getParent(i, j, direction);

    const across = _.filter(writableLocations, isSameWord('across'));
    const down = _.filter(writableLocations, isSameWord('down'));
    return {across, down};
  }

  getPossiblePickupLocations(solution) {
    const writableLocations = this.getWritableLocations();
    const isCorrect = (cells) => _.every(cells, ({i, j}) => this.grid[i][j].value === solution[i][j]);

    return _.filter(writableLocations, ({i, j}) => {
      const {across, down} = this.getCrossingWords(i, j);
      return !isCorrect(across) && !isCorrect(down);
    });
  }

  getCellByNumber(number) {
    if (!this.cellsByNumber) {
      this.computeCellsByNumber();
    }
    return this.cellsByNumber[number];
  }

  fixSelect({r, c}) {
    // Find the next valid white square in line order
    while (!this.isWhite(r, c)) {
      if (c + 1 < this.grid[r].length) {
        c += 1;
      } else {
        r += 1;
        c = 0;
      }
    }
    return {r, c};
  }

  isInBounds(r, c) {
    return r >= 0 && c >= 0 && r < this.grid.length && c < this.grid[r].length;
  }

  isFilled(r, c) {
    return this.grid[r][c].value !== '';
  }

  isWhite(r, c) {
    return !this.grid[r][c].black;
  }

  isWriteable(r, c) {
    return this.isInBounds(r, c) && this.isWhite(r, c);
  }

  getParent(r, c, direction) {
    return this.grid[r][c].parents?.[direction] ?? 0;
  }

  isStartOfClue(r, c, direction) {
    if (!this.isWhite(r, c)) {
      return false;
    }
    if (direction === 'across') {
      return !this.isWriteable(r, c - 1) && this.isWriteable(r, c + 1);
    }
    if (direction === 'down') {
      return !this.isWriteable(r - 1, c) && this.isWriteable(r + 1, c);
    }
    throw new Error(`Invalid direction: ${direction}`);
  }

  isSqueezedSquare(r, c, direction) {
    if (!this.isWhite(r, c)) {
      return false;
    }
    if (direction === 'across') {
      return !this.isWriteable(r, c - 1) && !this.isWriteable(r, c + 1);
    }
    if (direction === 'down') {
      return !this.isWriteable(r - 1, c) && !this.isWriteable(r + 1, c);
    }
    throw new Error(`Invalid direction: ${direction}`);
  }

  assignNumbers() {
    // Mutate the cells in the grid and set the numbers and parents
    // for faster future calculations.
    let nextNumber = 1;
    for (const [r, c, cell] of this.items()) {
      if (!this.isWhite(r, c)) {
        continue;
      } else if (this.isStartOfClue(r, c, 'across') || this.isStartOfClue(r, c, 'down')) {
        cell.number = nextNumber;
        nextNumber += 1;
      } else {
        cell.number = null;
      }

      cell.parents = {
        across: this.isStartOfClue(r, c, 'across')
          ? cell.number
          : this.isSqueezedSquare(r, c, 'across')
          ? 0
          : this.grid[r][c - 1].parents.across,
        down: this.isStartOfClue(r, c, 'down')
          ? cell.number
          : this.isSqueezedSquare(r, c, 'down')
          ? 0
          : this.grid[r - 1][c].parents.down,
      };
    }
    this.computeCellsByNumber();
  }

  computeCellsByNumber() {
    this.cellsByNumber = {};
    for (const [r, c, cell] of this.items()) {
      if (cell.number) {
        this.cellsByNumber[cell.number] = {r, c};
      }
    }
  }

  alignClues(clues) {
    const result = {
      across: [],
      down: [],
    };
    for (const cell of this.values()) {
      for (const direction of ['across', 'down']) {
        if (!cell.black && cell.parents && cell.parents[direction] === cell.number) {
          result[direction][cell.number] = (clues && clues[direction] && clues[direction][cell.number]) || '';
        }
      }
    }
    return result;
  }

  toArray() {
    return this.grid;
  }

  toTextGrid() {
    return this.grid.map((row) => row.map((cell) => (cell.black ? '.' : cell.value)));
  }
}
