const MAX_CLOCK_INCREMENT = 1000 * 60;

function getScopeGrid(grid, scope) {
  const scopeGrid = grid.map(row => row.map(cell => false));
  scope.forEach(({r, c}) => {scopeGrid[r][c] = true});
  return scopeGrid;
}

const reducers = {
  create: (game, params) => {
    const {
      info = {},
      grid = [ [ {} ] ],
      solution = [ [ '' ] ],
      circles = [],
      chat = { messages: [] },
      cursor = {},
      clues = {},
      clock = {
        startTime: 0,
        pausedTime: 0,
        isPaused: true,
      },
    } = params.game;

    return {
      info,
      grid,
      solution,
      circles,
      chat,
      cursor,
      clues,
      clock,
    };
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
    const { scope = [] } = params;
    let { grid, solution } = game;
    const scopeGrid = getScopeGrid(grid, scope);
    grid = grid.map((row, i) => (
      row.map((cell, j) => (scopeGrid[i][j]
        ? {
          ...cell,
          good: cell.value !== '' && cell.value === solution[i][j],
          bad: cell.value !== '' && cell.value !== solution[i][j],
          pencil: false,
        }
        : cell
      ))
    ));
    return {
      ...game,
      grid,
    };
  },

  reveal: (game, params) => {
    const { scope = [] } = params;
    let { grid, solution } = game;
    const scopeGrid = getScopeGrid(grid, scope);
    grid = grid.map((row, i) => (
      row.map((cell, j) => (scopeGrid[i][j]
        ? {
          ...cell,
          value: solution[i][j],
          good: true,
          pencil: false,
          revealed: cell.revealed || (cell.value !== solution[i][j])
        }
        : cell
      ))
    ));
    return {
      ...game,
      grid,
    };
  },

  reset: (game, params) => {
    const { scope = [] } = params;
    let { grid } = game;
    const scopeGrid = getScopeGrid(grid, scope);
    grid = grid.map((row, i) => (
      row.map((cell, j) => (scopeGrid[i][j]
        ? {
          ...cell,
          value: '',
          good: false,
          bad: false,
          revealed: false,
          pencil: false,
        }
        : cell
      ))
    ));
    return {
      ...game,
      grid,
    };
  },

  updateClock: (game, params) => {
    const action = params.action;
    const { timestamp } = params;
    let { clock } = game;
    if (action === 'pause') {
      clock = {
        ...clock,
        pausedTime: clock.pausedTime + timestamp - clock.startTime,
        startTime: 0,
        paused: true,
      };
    } else if (action === 'start') {
      clock = {
        ...clock,
        startTime: timestamp,
        paused: false,
      };
    } else if (action === 'reset') {
      clock = {
        ...clock,
        startTime: 0,
        pausedTime: 0,
        paused: true,
      };
    }
    return {
      ...game,
      clock,
    };
  },

  chat: (game, params) => {
    let { chat } = game;
    const { text, senderId, sender } = params;
    const { messages = [] } = chat;
    chat = {
      ...chat,
      messages: [
        ...messages,
        {
          text,
          senderId,
          sender,
        }
      ],
    };

    return {
      ...game,
      chat,
    };
  },
};

export const tick = (game, timestamp) => {
  let {
    clock = {
      totalTime: 0,
      lastUpdated: timestamp,
    },
  } = game;
  const timeDiff = (clock.paused
    ? 0
    : Math.max(0, Math.min(
        timestamp - clock.lastUpdated,
        MAX_CLOCK_INCREMENT))
  );
  clock = {
    ...clock,
    lastUpdated: timestamp,
    totalTime: clock.totalTime + timeDiff,
  };
  return {
    ...game,
    clock,
  };
};

export const reduce = (game, action) => {
  const { timestamp, type, params } = action;
  if (!(type in reducers)) {
    console.error('action', type, 'not found');
    return game;
  }
  game = reducers[type](game, params);
  game = tick(game, timestamp);
  return game;
};
