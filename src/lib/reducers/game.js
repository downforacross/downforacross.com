import {MAX_CLOCK_INCREMENT} from '../timing';
import {MAIN_BLUE_3} from '../colors';
import _ from 'lodash';

function getScopeGrid(grid, scope) {
  const scopeGrid = grid.map((row) => row.map(() => false));
  scope.forEach(({r, c}) => {
    scopeGrid[r][c] = true;
  });
  return scopeGrid;
}

function isSolved(game) {
  const {grid, solution} = game;
  // TODO this can be memoized
  function isRowSolved(gridRow, solutionRow) {
    for (let i = 0; i < gridRow.length; i += 1) {
      if (!(solutionRow[i] === '.' || solutionRow[i] === gridRow[i].value)) {
        return false;
      }
    }
    return true;
  }
  for (let i = 0; i < grid.length; i += 1) {
    if (!isRowSolved(grid[i], solution[i])) {
      return false;
    }
  }
  return true;
}

const reducers = {
  create: (game, params) => {
    const {pid} = params;
    const {
      info = {},
      grid = [[{}]],
      solution = [['']],
      circles = [],
      chat = {messages: []},
      clues = {},
      clock = {
        lastUpdated: 0,
        totalTime: 0,
        paused: true,
      },
      cursors = [],
      // users is a mapping from id -> user info. fields include:
      // color: string
      // displayName: string
      users = {},
      solved = false,
      themeColor = MAIN_BLUE_3,
      // themeColor = GREENISH,
    } = params.game;
    clock.trueTotalTime = 0;

    return {
      pid,
      info,
      grid,
      solution,
      circles,
      chat,
      clues,
      clock,
      solved,
      cursors,
      users,
      themeColor,
      optimisticCounter: 0,
    };
  },

  updateCursor: (game, params) => {
    let {cursors = []} = game;

    const {
      cell: {r, c},
      id,
      timestamp,
    } = params;

    cursors = cursors
      .filter((cursor) => cursor.id !== id)
      .concat([
        {
          r,
          c,
          id,
          timestamp,
        },
      ]);

    return {
      ...game,
      cursors,
    };
  },

  addPing: (game, params) => {
    let {pings = []} = game;
    const {
      cell: {r, c},
      id,
      timestamp,
    } = params;

    const ping = {
      r,
      c,
      id,
      timestamp,
    };
    pings = [...pings, ping];
    return {
      ...game,
      pings,
    };
  },

  updateDisplayName: (game, params) => {
    let {users = {}} = game;
    const {id, displayName} = params;
    users = {
      ...users,
      [id]: {
        ...users[id],
        displayName,
      },
    };
    return {
      ...game,
      users,
    };
  },

  updateColor: (game, params) => {
    let {users = {}} = game;
    const {id, color} = params;
    users = {
      ...users,
      [id]: {
        ...users[id],
        color,
      },
    };
    return {
      ...game,
      users,
    };
  },

  updateCell: (game, params) => {
    let {grid} = game;
    const {
      cell: {r, c},
      value,
      pencil = false,
    } = params;
    if (!game.solved && !grid[r][c].good) {
      grid = Object.assign([], grid, {
        [r]: Object.assign([], grid[r], {
          [c]: {
            ...grid[r][c],
            value,
            bad: false,
            pencil,
            user_id: value ? params.id : '',
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
    const {scope = []} = params;
    let {grid, solution} = game;
    const scopeGrid = getScopeGrid(grid, scope);
    grid = grid.map((row, i) =>
      row.map((cell, j) =>
        scopeGrid[i][j]
          ? {
              ...cell,
              good: cell.value !== '' && cell.value === solution[i][j],
              bad: cell.value !== '' && cell.value !== solution[i][j],
              pencil: false,
            }
          : cell
      )
    );
    return {
      ...game,
      grid,
    };
  },

  reveal: (game, params) => {
    const {scope = []} = params;
    let {grid, solution} = game;
    const scopeGrid = getScopeGrid(grid, scope);
    grid = grid.map((row, i) =>
      row.map((cell, j) =>
        scopeGrid[i][j]
          ? {
              ...cell,
              value: solution[i][j],
              good: true,
              pencil: false,
              revealed: cell.revealed || cell.value !== solution[i][j],
              user_id: cell.value === solution[i][j] ? cell.user_id : undefined,
            }
          : cell
      )
    );
    return {
      ...game,
      grid,
    };
  },

  reset: (game, params) => {
    if (game.solved) {
      return game;
    }
    const {scope = []} = params;
    let {grid} = game;
    const scopeGrid = getScopeGrid(grid, scope);
    grid = grid.map((row, i) =>
      row.map((cell, j) =>
        scopeGrid[i][j]
          ? {
              ...cell,
              value: '',
              good: false,
              bad: false,
              revealed: false,
              pencil: false,
            }
          : cell
      )
    );
    return {
      ...game,
      grid,
    };
  },

  updateClock: (game, params) => {
    const {action} = params;
    let {clock} = game;
    if (action === 'pause') {
      // no-op, will be handled by tick
    } else if (action === 'start') {
      // no-op, will be handled by tick
    } else if (action === 'reset') {
      clock = {
        ...clock,
        totalTime: 0,
        paused: true,
      };
    }
    return {
      ...game,
      clock,
    };
  },

  chat: (game, params, timestamp) => {
    let {chat} = game;
    const {text, senderId, sender} = params;
    const {messages = []} = chat;
    chat = {
      ...chat,
      messages: [
        ...messages,
        {
          text,
          senderId,
          sender,
          timestamp,
        },
      ],
    };

    return {
      ...game,
      chat,
    };
  },
  startGame: (game) => ({
    ...game,
    isFencing: true,
  }),
  updateTeamId: (game, params) => {
    console.log(params);
    return {
      ...game,
      fencingUsers: _.uniq([...(game.fencingUsers || []), params.id]),
    };
  },
};

const incrementOptimisticCounter = (game) => ({
  ...game,
  optimisticCounter: game.optimisticCounter + 1,
});

export const tick = (game, timestamp, isPause) => {
  if (!timestamp) {
    return game;
  }
  let {
    clock = {
      totalTime: 0,
      trueTotalTime: 0,
      lastUpdated: timestamp,
    },
  } = game;
  const timeDiff = clock.paused
    ? 0
    : Math.max(0, Math.min(timestamp - clock.lastUpdated, MAX_CLOCK_INCREMENT));
  clock = {
    ...clock,
    lastUpdated: timestamp,
    totalTime: clock.totalTime + timeDiff,
    trueTotalTime: clock.trueTotalTime + timeDiff,
    paused: isPause,
  };
  return {
    ...game,
    clock,
  };
};

const checkSolved = (game) => ({
  ...game,
  solved: isSolved(game),
});

export const reduce = (game, action, options = {}) => {
  const {timestamp, type, params} = action;
  if (!(type in reducers)) {
    console.error('action', type, 'not found');
    return game;
  }
  try {
    game = reducers[type](game, params, timestamp);

    game = checkSolved(game);
    const isPause =
      (type === 'updateClock' && params && params.action === 'pause') || type === 'create' || game.solved;
    if (options.isOptimistic) {
      game = incrementOptimisticCounter(game);
    } else {
      game = tick(game, timestamp, isPause);
    }
  } catch (e) {
    console.error('Error handling action', action);
  }
  return game;
};
