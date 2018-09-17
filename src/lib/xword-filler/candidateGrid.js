export default class CandidateGrid {
  constructor(grid, entries) {
    // note: this.grid is immutable
    this.grid = grid;
    this.entries = entries;
  }


  // todo wrap this in a CandidateGrid object
  getPattern(entry) {
    return entry.map(({r, c}) => (
      this.getValue(r, c) || ' '
    )).join('');
  }

  // todo wrap this in a CandidateGrid object
  getValue(r, c) {
    return this.grid[r][c].value;
  }

  setEntry(entry, word) {
    const nextGrid = this.grid.map(row => [...row]);
    entry.forEach(({r, c}, i) => {
      // i is the index of the cell {r,c} in the actual word (b.c. down/across are consistent with row major ordering)

      // TODO replace this with a call to CandidateGrid.getChar(r, r)
      if (this.getValue(r, c) === '') {
        nextGrid[r][c].value = word[i];
        nextGrid[r][c].pencil = true;
      }
    });
    return new CandidateGrid(nextGrid, this.entries);
  }

  isComplete() {
    // TODO check stuckness?
    for (const entry of this.entries) {
      const pattern = this.getPattern(entry);
      if (pattern.indexOf(' ')) {
        return false;
      }
    }
    return true;
  }

  computeHeuristic(scoredWordlist) {
    return Math.random();
  }

  computeEntryHeuristic(entry, scoredWordlist) {
    return Math.random();
  }
}
