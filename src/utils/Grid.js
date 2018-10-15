import _ from 'lodash';

export default class Grid {
  constructor(grid) {
    this.grid = grid;
    if (!grid) {
      throw new Error('Attempting to wrap an undefined grid object.');
    }
    if (!_.isArray(grid)) {
      throw new Error('Invalid type for grid object: ' + typeof grid);
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
    } else {
      return undefined;
    }
  }

  getNextEmptyCell(r, c, direction, options = {}) {
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
      // move to start of word
      do {
        if (direction === 'across') {
          c -= 1;
        } else {
          r -= 1;
        }
      } while (this.isWriteable(r, c));
      if (direction === 'across') {
        c += 1;
      } else {
        r += 1;
      }

      // recurse but not infinitely
      return this.getNextEmptyCell(r, c, direction, {
        noWraparound: true,
      });
    }
    return undefined;
  }

  hasEmptyCells(r, c, direction) {
    return this.getNextEmptyCell(r, c, direction) !== undefined;
  }

  getCellByNumber(number) {
    for (const [r, c, cell] of this.items()) {
      if (cell.number === number) {
        return {r, c};
      }
    }
  }

  fixSelect({r, c}, grid) {
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
    return this.grid[r][c].parents[direction];
  }

  isStartOfClue(r, c, direction) {
    if (!this.isWhite(r, c)) {
      return false;
    } else if (direction === 'across') {
      return !this.isWriteable(r, c - 1) && this.isWriteable(r, c + 1);
    } else if (direction === 'down') {
      return !this.isWriteable(r - 1, c) && this.isWriteable(r + 1, c);
    } else {
      throw new Error('Invalid direction: ' + direction);
    }
  }

  isSqueezedSquare(r, c, direction) {
    if (!this.isWhite(r, c)) {
      return false;
    } else if (direction === 'across') {
      return !this.isWriteable(r, c - 1) && !this.isWriteable(r, c + 1);
    } else if (direction === 'down') {
      return !this.isWriteable(r - 1, c) && !this.isWriteable(r + 1, c);
    } else {
      throw new Error('Invalid direction: ' + direction);
    }
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

  resize(newSize) {
    console.log('GOT', newSize);
    return this.grid;
  }

  toArray() {
    return this.grid;
  }

  toTextGrid() {
    return this.grid.map((row) => row.map((cell) => (cell.black ? '.' : cell.value)));
  }
}
