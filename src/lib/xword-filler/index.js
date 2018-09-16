import _ from 'lodash';
import gaussian from 'gaussian';

// randomize our word list, to introduce non-determinism early in the process.
// non-determinism is important if we don't to generate the same puzzle every timeI

const normal = gaussian(0, 1)

const sample = (mean, stdev) => (
  mean + normal.ppf(Math.random()) * stdev
)

// scoredWords: an object of shape { word: { score, stdev }, ... }
// returns an object with same keys { word: sampledScore } 
const assignScores = (wordlist) => (
  _.reduce(_.keys(wordlist), (r, k) => ({
    [k]: sample(wordlist[k].score, wordlist[k].stdev)
  }), {})

)


const generateDefaultWordlist = () => {
  console.log(window.nyt_words.length);
  const result = {};
  _.forEach(window.nyt_words, (k) => {
    result[k] = {
      score: 0,
      stdev: 10,
    };
  });
  return result;
}

console.log('generating', Date.now())
const DEFAULT_WORDLIST = generateDefaultWordlist()
// console.log('generated', DEFAULT_WORDLIST)
console.log(Date.now())

// partialGrid: Array(Array(cell))
// cell: { value: '.' if black, '[a-z]' or '' otherwise, pencil: boolean/null }
export const fillGrid = (partialGrid, wordlist = DEFAULT_WORDLIST) => {
  console.log('nyt', window.nyt_words)
  console.log('wordlist', wordlist, Date.now())
  const scoredWordlist = assignScores(wordlist)
  console.log('scoredWordlist', wordlist, Date.now())
  debugger
  const grid = partialGrid.map(row => (
    row.map(cell => ({
      ...cell,
      value: cell.value === '' ? '?' : cell.value,
    }))
  ));
  return grid
}
