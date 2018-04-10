const reducers = {
  create: (game, params) => {
    return params.game;
  },
  updateCursor: (game, params) => {
    let {
      cursors = [],
    } = game;

    const {
      cell: {r, c},
      id,
      timestamp,
      color,
    } = params;

    cursors = cursors
      .filter(
        cursor => cursor.id !== id
      )
      .concat([{
        r,
        c,
        id,
        timestamp,
        color,
      }]);

    return {
      ...game,
      cursors,
    };
  },

  updateCell: (game, params) => {
    let { grid } = game;
    const {
      cell: { r, c },
      value,
    } = params
    if (!game.solved && !grid[r][c].good) {
      grid = Object.assign([], grid, {
        [r]: Object.assign([], grid[r], {
          [c]: {
            ...grid[r][c],
            value,
            bad: false,
          },
        }),
      });
    }
    return {
      ...game,
      grid,
    };
  },

  check: (game, params) => {
    const { scopeString, squares } = params;
    let { grid, solution } = game;
    grid = grid.map((row, i) => (
      row.map((cell, j) => (
        {
          ...cell,
          good: cell.value !== '' && cell.value === solution[i][j],
          bad: cell.value !== '' && cell.value !== solution[i][j],
          pencil: false,
        }
      ))
    ));
    return {
      ...game,
      grid,
    };
  },

  reveal: (game, params) => {
    return game;
  },

  clock: (game, params) => {
    return game;
  },
};

export const reduce = (game, action) => {
  const { type, params } = action;
  if (!(type in reducers)) {
    console.error('action', type, 'not found');
    return game;
  }
  return reducers[type](game, params);
};
