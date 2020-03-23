import _ from 'lodash';
import gaussian from 'gaussian';
import {convertToCandidateGrid, convertFromCandidateGrid} from './candidateGrid';
import beamSearch from './beamSearch';
// randomize our word list, to introduce non-determinism early in the process.
// non-determinism is important if we don't to generate the same puzzle every timeI

const normal = gaussian(0, 1);

const sample = (mean, stdev) => Math.max(0.0001, mean + normal.ppf(Math.random()) * stdev);

// scoredWords: an object of shape { word: { score, stdev }, ... }
// returns an object with same keys { word: sampledScore }
const assignScores = (wordlist) => {
  const result = {};
  _.forEach(_.keys(wordlist), (k) => {
    result[k] = sample(wordlist[k].score, wordlist[k].stdev);
  });
  return result;
};

const makeWordlist = (words, score = 30, stdev = 10) => {
  const result = {};
  _.forEach(words, (k) => {
    k = k.toUpperCase();
    if (k.length > 7) return;
    result[k] = {
      score,
      stdev,
    };
  });
  return result;
};

const DEFAULT_WORDLIST = makeWordlist(window.nyt_words);

const getFullWords = (partialGrid) => {
  const candidateGrid = convertToCandidateGrid(partialGrid);
  const words = candidateGrid.entries.map((entry) => candidateGrid.getPattern(entry));
  return words; // _.filter(words, word => word.indexOf(" ") === -1);
};
window.getFullWords = getFullWords;

// partialGrid: Array(Array(cell))
// cell: { value: '.' if black, '[a-z]' or '' otherwise, pencil: boolean/null }
export const fillGrid = (partialGrid, wordlist = DEFAULT_WORDLIST) => {
  wordlist = {
    ...wordlist,
    // ...makeWordlist(fullWords, 80, 0),
  };
  const scoredWordlist = assignScores(wordlist);

  const initialState = convertToCandidateGrid(partialGrid);
  const bestCandidate = beamSearch(initialState, scoredWordlist);
  const grid = convertFromCandidateGrid(bestCandidate);
  const resultGrid = grid.map((row, r) =>
    row.map((cell, c) => ({
      ...cell,
      value: cell.value === ' ' ? '?' : cell.value,
      pencil: (cell.value !== '.' && partialGrid[r][c].value !== cell.value) || partialGrid[r][c].pencil,
    }))
  );
  return resultGrid;
};
