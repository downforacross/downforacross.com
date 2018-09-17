import _ from 'lodash';
import gaussian from 'gaussian';
import { makeGridFromComposition } from '../../gameUtils';
import CandidateGrid from './candidateGrid';
import beamSearch from './beamSearch';
import { getMatches } from './common';
// randomize our word list, to introduce non-determinism early in the process.
// non-determinism is important if we don't to generate the same puzzle every timeI

const normal = gaussian(0, 1)

const sample = (mean, stdev) => (
  mean + normal.ppf(Math.random()) * stdev
)

// scoredWords: an object of shape { word: { score, stdev }, ... }
// returns an object with same keys { word: sampledScore } 
const assignScores = (wordlist) => {
  const result = {};
  _.forEach(_.keys(wordlist), k => {
    result[k] = sample(wordlist[k].score, wordlist[k].stdev);
  });
  return result;
}


const generateDefaultWordlist = () => {
  const result = {};
  _.forEach(window.nyt_words, (k) => {
    if (k.length > 7) return;
    result[k] = {
      score: 0,
      stdev: 10,
    };
  });
  return result;
}

const DEFAULT_WORDLIST = generateDefaultWordlist()
// partialGrid: Array(Array(cell))
// cell: { value: '.' if black, '[a-z]' or '' otherwise, pencil: boolean/null }
export const fillGrid = (partialGrid, wordlist = DEFAULT_WORDLIST) => {
  const scoredWordlist = assignScores(wordlist)

  // precompute static properties of grid
  const gridObject = makeGridFromComposition(partialGrid);
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

  const initialState = new CandidateGrid(partialGrid, entries);
  const bestCandidate = beamSearch(initialState, scoredWordlist);
  const grid = bestCandidate.grid.map(row => (
    row.map(cell => ({
      ...cell,
      value: cell.value === '' ? '?' : cell.value,
      pencil: cell.pencil || cell.value === '',
    }))
  ));
  return grid;
}
