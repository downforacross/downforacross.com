import Grid from './utils/Grid'
import { getTime } from './actions';

export const getOppositeDirection = (direction) => {
  return {
    'across': 'down',
    'down': 'across'
  }[direction];
};

export const makeEmptyGame = () => (
  {
    gid: undefined,
    name: undefined,
    info: undefined,
    clues: {
      across: [],
      down: [],
    },
    solution: [['']],
    grid: [[{
      black: false,
      number: 1,
      edits: [],
      value: '',
      parents: {
        across: 1,
        down: 1
      }
    }]],
    createTime: undefined,
    startTime: undefined,
    chat: {
      users: [],
      messages: [],
    },
    circles: []
  }
);

export const makeGrid = (textGrid, fillWithSol) => {
  const newGridArray = textGrid.map(row =>
    row.map(cell => ({
      black: cell === '.',
      edits: [],
      value: fillWithSol ? cell :  '',
      number: null
    }))
  );
  const grid = new Grid(newGridArray);
  grid.assignNumbers();
  return grid;
};

export const makeGame = (gid, name, puzzle) => {
  const grid = makeGrid(puzzle.grid);
  const clues = grid.alignClues(puzzle.clues);
  const game = {
    gid: gid,
    name: name,
    info: puzzle.info,
    circles: puzzle.circles || [],
    shades: puzzle.shades || [],
    clues: clues,
    solution: puzzle.grid,
    pid: puzzle.pid || null,
    grid: grid.toArray(),
    createTime: getTime(),
    startTime: null,
    chat: {
      users: [],
      messages: []
    },
  };
  return game;
};

export const allNums = (str) => {
  let pattern = /\d+/g;
  return (str.match(pattern) || []).map(x => parseInt(x, 10));
};

export const getReferencedClues = (str, clues) => {
  if (!str) return [];
  str = str.toLowerCase();
  let res = [];
  while (str.indexOf('across') !== -1 || str.indexOf('down') !== -1) {
    let a = str.indexOf('across');
    let b = str.indexOf('down');
    if ((a < b || b === -1) && a !== -1) {
      let nums = allNums(str.substring(0, a));
      res = res.concat(nums.map(num => ({
        ori: 'across',
        num: num,
      })));
      str = str.substr(a + 'across'.length);
    } else {
      let nums = allNums(str.substring(0, b));
      res = res.concat(nums.map(num => ({
        ori: 'down',
        num: num,
      })));
      str = str.substr(b + 'down'.length);
    }
  }
  if (str.indexOf('starred clues') !== -1) {
    ['down', 'across'].forEach(dir => {
      clues[dir].forEach((clueText, i) => {
        if (clueText.startsWith('*')) {
          res.push({
            ori: dir,
            num: i,
          });
        }
      });
    });
  }
  return res;
};
