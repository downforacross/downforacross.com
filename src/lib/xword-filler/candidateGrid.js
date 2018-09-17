import _ from 'lodash';
import { getTopMatches, countMatches } from './common';

export default class CandidateGrid {
  constructor(grid, entries) {
    // note: this.grid is immutable
    this.grid = grid;
    this.entries = entries;
    /*this.s = _.map(this.grid, r => (
      _.map(r, ({value}) => value).join('')
    )).join(',')*/
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
    const nextGrid = this.grid.map(row => row.map(cell => ({...cell})));
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

  isEntryComplete(entry) {
    const pattern = this.getPattern(entry);
    if (pattern.indexOf(' ') !== -1) {
      return false;
    }
    return true;
  }

  isComplete() {
    // TODO check stuckness?
    for (const entry of this.entries) {
      const pattern = this.getPattern(entry);
      if (pattern.indexOf(' ') !== -1) {
        return false;
      }
    }
    return true;
  }

  computeHeuristic(scoredWordlist) {
    const entryScores = _.map(this.entries, entry => {
      const pattern = this.getPattern(entry);
      const numMatches = countMatches(pattern, scoredWordlist);
      if (numMatches === 0) {
        return -100;
      }
      return Math.log10(numMatches);
    });
    return _.sum(entryScores);
  }

  computeEntryHeuristic(entry, scoredWordlist) {
    const pattern = this.getPattern(entry);
    const topMatches = getTopMatches(pattern, scoredWordlist, 10);
    return _.sum(_.map(topMatches, (word, i) => (
      scoredWordlist[word] * Math.pow(0.9, i)
    )))
  }
}
