import Puz from 'puzjs';
import GridObject from './utils/Grid';

const infoToMeta = info => {
  const {
    title = '',
    author = '',
    description = '',
    notes = '',
    copyright = '',
  } = info;
  return {
    description,
    title,
    notes,
    author,
    copyright,
  };
};

const gridToTextGrid = grid => {
  return grid.map(row => row.map(cell => (
    cell.black ? '.' : cell.value
  )));
};

// to hanlde the various different formats of games
const f = () => ({
  fromPuz: (blob) => {
    const {
      meta,
      grid,
      clues,
      circles,
      shades,
      filename,
    } = Puz.decode(blob);
    return intermediate({
      info: {},
      grid,
      clues,
      extras: {
        circles,
      },
    });
  },

  fromComposition: (composition) => {
    const {
      info,
      grid: compositionGrid,
      clues: compositionClues,
      circles = [],
    } = composition;

    const grid = compositionGrid.map(row =>
      row.map(({value, pencil}) => ({
        black: value === '.',
        value: value === '.' ? '' : value,
        pencil,
        number: null
      }))
    );
    new GridObject(grid).assignNumbers();

    const unalignedClues = {
      across: [],
      down: [],
    };
    compositionClues.forEach(({r, c, dir, value}) => {
      const num = grid[r][c].number;
      if (num) {
        unalignedClues[dir][num] = value;
      }
    });
    const clues = new GridObject(grid).alignClues(unalignedClues);

    return intermediate({
      info,
      grid,
      clues,
      extras: {
        circles,
        shades: [],
      },
    });
  },

  fromPuzzle: () => {
    // TODO
  },

  fromGame: () => {
    // TODO
  },
});

const validateGame = ({ info, grid, clues, circles }) => {
  const {
    title, author, description,
  } = info;
  if (typeof grid[0][0] !== 'object') {
    throw new Error('Game grid should be object');
  }
  // TODO finish this
}

const validateIntermediate = validateGame;

const validateComposition = ({ info, grid, clues, circles }) => {
  const {
    title, author, description,
  } = info;
}

const validatePuz = (blob) => {
  if (!(blob instanceof Uint8Array)) {
    throw new Error('Puz must be a Uint8Array');
  }
}

const intermediate = ({ info, grid, clues, extras }) => {
  validateIntermediate({ info, grid, clues, extras });
  return {
    toPuz: () => {
      const x = {
        meta: infoToMeta(info),
        grid: gridToTextGrid(grid),
        clues,
        circles: extras.circles,
      };
      return Puz.encode({
        meta: infoToMeta(info),
        grid: gridToTextGrid(grid),
        clues,
        circles: extras.circles,
      })
    },

    toComposition: () => ({
      // TODO
    }),

    toPuzzle: () => ({
      grid,
      info,
      circles: extras.circles,
      shades: extras.shades,
      across: clues.across,
      down: clues.down,
    }),

    toGame: () => ({
      // TODO
    }),
  };
};

export default f;
