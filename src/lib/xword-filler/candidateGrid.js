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
  const width = grid[0].length;
  const height = grid.length;
  let entryMap = [];
  gridObject.items().forEach(([r, c, value]) => {
    if (value.black) return;
    if (!value.parents) throw new Error(`cell has no parents: ${r} ${c} ${JSON.stringify(value)}`);
    const cell = r * width + c;
    entryMap[cell] = value.parents;
    ['across', 'down'].forEach(orientation => {
      const entry = entriesDict[orientation][value.parents[orientation]] || [];
      entry.push(cell);
      entriesDict[orientation][value.parents[orientation]] = entry;
    });
  });

  const entries = [];
  ['across', 'down'].forEach(orientation => {
    entriesDict[orientation].forEach((obj) => {
      obj.idx = entries.length;
      entries.push(obj);
    });
  });
  entryMap = entryMap.map(obj => ({
    across: entriesDict.across[obj.across].idx,
    down: entriesDict.down[obj.down].idx,
  }));

  const gridString = _.flatten(
    _.map(grid, row => (
      _.map(row, ({value}) => value || ' ')
    ))
  );

  return new CandidateGrid(gridString, width, height, entries, entryMap);
}

export default class CandidateGrid {
  constructor(gridString, width, height, entries, entryMap) {
    this.gridString = gridString;
    this.entries = entries;
    this.width = width;
    this.height = height;
    this.entryMap = entryMap;
  }

  // todo wrap this in a CandidateGrid object
  getPattern(entry) {
    let result = '';
    for (let i = 0; i < entry.length; i += 1) {
      result += this.gridString[entry[i]];
    }
    return result;
  }

  setCell(cell, value) {
    const nextGridString = [...this.gridString];
    nextGridString[cell] = value;
    return new CandidateGrid(nextGridString, this.width, this.height, this.entries, this.entryMap);
  }

  isCellComplete(cell) {
    return this.gridString[cell] !== ' ';
  }

  isComplete() {
    return this.gridString.indexOf(' ') === -1;
  }

  computeHeuristic(scoredWordlist) {
    const entryScores = _.map(this.entries, entry => {
      const pattern = this.getPattern(entry);
      if (countMatches(pattern, scoredWordlist) === 0) {
        return -100;
      }
      return Math.log10(countMatches(pattern, scoredWordlist));
      const topMatches = getTopMatches(pattern, scoredWordlist, 10);
      return _.sum(_.map(topMatches, (word, i) => (
        scoredWordlist[word] * Math.pow(0.9, i)
      )))
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

  computeCellHeuristic(cell, scoredWordlist) {
    const entryAcross = this.entries[this.entryMap[cell].across];
    const entryDown = this.entries[this.entryMap[cell].down];
    return this.computeEntryHeuristic(entryAcross, scoredWordlist) + this.computeEntryHeuristic(entryDown);
  }
}
