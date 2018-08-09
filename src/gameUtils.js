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

export const makeGridFromComposition = (compositionGrid) => {
  const newGridArray = compositionGrid.map(row =>
    row.map(({value, pencil}) => ({
      black: value === '.',
      value: value === '.' ? '' : value,
      pencil,
      number: null
    }))
  );
  const grid = new Grid(newGridArray);
  grid.assignNumbers();
  return grid;
};


export const makeClues = (cluesBySquare, grid) => {
  const result = {
    across: [],
    down: [],
  };
  console.log(grid, cluesBySquare);
  cluesBySquare.forEach(({r, c, dir, value}) => {
    const num = grid[r][c].number;
    if (num) {
      result[dir][num] = value;
    }
  });
  return result;
};

export const convertCluesForComposition = (clues, gridObject) => {
  const alignedClues = gridObject.alignClues(clues);
  const result = [];
  ['across', 'down'].forEach(dir => {
    alignedClues[dir].forEach((value, i) => {
      if (value) {
        const cell = gridObject.getCellByNumber(i);
        if (!cell) {
          debugger;
          return;
        }
        const { r, c } = cell;
        result.push({
          dir,
          r,
          c,
          value,
        });
      }
    });
  });
  return result;
};

export const convertGridForComposition = (grid) => {
  return grid.map(row => row.map(value => ({
    value,
  })));
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

export const makeEmptyClues = gridArray => {
  const grid = new Grid(gridArray);
  return grid.alignClues({
    across: [],
    down: [],
  });
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

  const referencesStars = (
    str.indexOf('starred') !== -1 &&
    ( str.indexOf('clue') !== -1 ||
      str.indexOf('entry') !== -1 ||
      str.indexOf('entries') !== -1
    )
  );
  if (referencesStars) {
    ['down', 'across'].forEach(dir => {
      clues[dir].forEach((clueText, i) => {
        const hasStar = clueText.trim().startsWith('*') || clueText.trim().endsWith('*');
        if (hasStar) {
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
