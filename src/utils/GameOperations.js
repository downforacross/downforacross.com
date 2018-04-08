const reducers = {
  create: (game, params) => {
    return params.game;
  },
  updateCursor: (game, params) => {
    let {
      cursors = [],
    } = game;

    const {
      cell,
      id,
      timestamp,
    } = params;

    cursors = cursors
      .filter(
        cursor => cursor.id !== id
      )
      .concat([{
        cell,
        id,
        timestamp,
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
    grid = Object.assign([], grid, {
      [r]: Object.assign([], grid[r], {
        [c]: {
          ...grid[r][c],
          value,
        },
      }),
    });
    console.log('updatecell', params, grid[r][c]);
    return {
      ...game,
      grid,
    };
  }
};

export const reduce = (game, action) => {
  const { type, params } = action;
  return reducers[type](game, params);
};
