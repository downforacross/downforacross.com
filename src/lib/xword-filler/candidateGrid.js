import _ from 'lodash';
import { makeGridFromComposition } from '../../gameUtils';
import { getTopMatches, countMatches } from './common';

export const convertFromCandidateGrid = (candidate) => {
  return _.range(candidate.height).map(r => (
    _.range(candidate.width).map(c => ({
      value: candidate.gridString[r * candidate.width + c],
      pencil: true, // todo fix
    }))
  ));
}

export const convertToCandidateGrid = (grid) => {
  // precompute static properties of grid
  const gridObject = makeGridFromComposition(grid);
  gridObject.assignNumbers();
  const entriesDict = {
    across: [],
    down: [],
  };
  gridObject.items().forEach(([r, c, value]) => {
    if (value.black) return;
    if (!value.parents) throw new Error(`cell has no parents: ${r} ${c} ${JSON.stringify(value)}`);
    ['across', 'down'].forEach(orientation => {
      const entry = entriesDict[orientation][value.parents[orientation]] || [];
      entry.push({ r, c })
      entriesDict[orientation][value.parents[orientation]] = entry;
    });
  });
  const entries = _.filter([
    ..._.values(entriesDict.across),
    ..._.values(entriesDict.down),
  ], _.identity);

  const gridString = _.flatten(
    _.map(grid, r => (
      _.map(r, ({value}) => value || ' ')
    ))
  );
  const width = grid[0].length;
  const height = grid.length;
  return new CandidateGrid(gridString, width, height, entries);
}

export default class CandidateGrid {
  constructor(gridString, width, height, entries) {
    this.gridString = gridString;
    this.entries = entries;
    /*this.s = _.map(this.grid, r => (
      _.map(r, ({value}) => value).join('')
    )).join(',')*/
    this.width = width;
    this.height = height;
  }

  // todo wrap this in a CandidateGrid object
  getPattern(entry) {
    let result = '';
    for (let i = 0; i < entry.length; i += 1) {
      result += this.getValue(entry[i].r, entry[i].c);
    }
    return result;
  }

  // todo wrap this in a CandidateGrid object
  getValue(r, c) {
    return this.gridString[r * this.width + c];
  }

  setEntry(entry, word) {
    const nextGridString = [...this.gridString];
    entry.forEach(({r, c}, i) => {
      // i is the index of the cell {r,c} in the actual word (b.c. down/across are consistent with row major ordering)

      // TODO replace this with a call to CandidateGrid.getChar(r, r)
      if (this.getValue(r, c) === ' ') {
        nextGridString[r * this.width + c] = word[i];
      }
    });

    return new CandidateGrid(nextGridString, this.width, this.height, this.entries);
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
