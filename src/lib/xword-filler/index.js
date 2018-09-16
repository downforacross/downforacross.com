import _ from 'lodash';
import gaussian from 'gaussian';
import { makeGridFromComposition } from '../../gameUtils';
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
    result[k] = {
      score: 0,
      stdev: 10,
    };
  });
  return result;
}

const DEFAULT_WORDLIST = generateDefaultWordlist()

// todo wrap this in a CandidateGrid object
function getPattern(partialGrid, entry) {
  return entry.map(({r, c}) => (
    getValue(partialGrid, r, c) || ' '
  )).join('');
}

// todo wrap this in a CandidateGrid object
function getValue(partialGrid, r, c) {
  return partialGrid[r][c].value;
}

// partialGrid: Array(Array(cell))
// cell: { value: '.' if black, '[a-z]' or '' otherwise, pencil: boolean/null }
export const fillGrid = (partialGrid, wordlist = DEFAULT_WORDLIST) => {
  const scoredWordlist = assignScores(wordlist)
  partialGrid = partialGrid.map(row => [...row]); // clone obj to mutate it later
  const gridObject = makeGridFromComposition(partialGrid);
  gridObject.assignNumbers();
  const entries = {
    across: [],
    down: [],
  };
  gridObject.items().forEach(([r, c, value]) => {
    if (value.black) return;
    if (!value.parents) throw new Error(`cell has no parents: ${r} ${c} ${JSON.stringify(value)}`);
    const entry = entries.across[value.parents.across] || [];
    entry.push({ r, c })
    entries.across[value.parents.across] = entry;
  });

  entries.across.forEach((entry) => {
    const pattern = getPattern(partialGrid, entry);
    const matches = getMatches(pattern, scoredWordlist);
    if (matches.length > 0) {
      entry.forEach(({r, c}, i) => {
        // i is the index of the cell {r,c} in the actual word (b.c. down/across are consistent with row major ordering)

        // TODO replace this with a call to CandidateGrid.getChar(r, r)
        if (getValue(partialGrid, r, c) === '') {
          partialGrid[r][c].value = matches[0][i];
          partialGrid[r][c].pencil = true;
        }
      })
    }
  });

  const grid = partialGrid.map(row => (
    row.map(cell => ({
      ...cell,
      value: cell.value === '' ? '?' : cell.value,
      pencil: cell.value === '',
    }))
  ));
  return grid
}
