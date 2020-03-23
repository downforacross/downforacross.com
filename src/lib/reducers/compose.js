import _ from 'lodash';

const reducers = {
  create: (composition, params) => {
    const {
      info = {},
      grid = [[{}]],
      circles = [],
      chat = {messages: []},
      cursor = {},
      clues = [],
    } = params.composition;

    return {
      info,
      grid,
      circles,
      chat,
      cursor,
      clues,
    };
  },

  updateComposition: (composition, params) => {
    // equivalent to create, but there can only be one create
    const {info = {}, grid = [[{}]], circles = [], clues = []} = params;

    return {
      ...composition,
      info,
      grid,
      circles,
      clues,
    };
  },

  updateGrid: (composition, params) => {
    // equivalent to create, but there can only be one create
    const {grid = [[{}]], circles = [], clues = []} = params;

    return {
      ...composition,
      grid,
      circles,
      clues,
    };
  },

  updateCursor: (composition, params) => {
    let {cursors = []} = composition;

    const {
      cell: {r, c},
      id,
      timestamp,
      color,
    } = params;

    cursors = cursors.filter((cursor) => cursor.id !== id).concat([
      {
        r,
        c,
        id,
        timestamp,
        color,
      },
    ]);

    return {
      ...composition,
      cursors,
    };
  },

  clearPencil: (composition) => {
    let {grid} = composition;
    grid = _.map(grid, (row) =>
      row.map((cell) => ({
        ...cell,
        pencil: cell.value === '.' ? null : false,
        value: cell.pencil ? '' : cell.value,
      }))
    );
    return {
      ...composition,
      grid,
    };
  },

  updateCellText: (composition, params) => {
    let {grid} = composition;
    const {
      cell: {r, c},
      value,
      pencil = false,
    } = params;
    grid = Object.assign([], grid, {
      [r]: Object.assign([], grid[r], {
        [c]: {
          ...grid[r][c],
          value,
          pencil,
        },
      }),
    });
    return {
      ...composition,
      grid,
    };
  },

  updateCellColor: (composition, params) => {
    let {grid} = composition;
    const {
      cell: {r, c},
      color,
    } = params;
    const value = color === 'black' ? '.' : '';
    grid = Object.assign([], grid, {
      [r]: Object.assign([], grid[r], {
        [c]: {
          ...grid[r][c],
          value,
          pencil: false,
        },
      }),
    });
    return {
      ...composition,
      grid,
    };
  },

  updateClue: (composition, params) => {
    let {clues} = composition;
    const {
      cell: {r, c},
      dir,
      value,
    } = params;
    clues = [
      ..._.filter(clues, (clue) => clue.r !== r || clue.c !== c || clue.dir !== dir),
      {
        r,
        c,
        dir,
        value,
      },
    ];
    return {
      ...composition,
      clues,
    };
  },

  updateTitle: (composition, params) => {
    const {info} = composition;
    const {text} = params;
    return {
      ...composition,
      info: {
        ...info,
        title: text,
      },
    };
  },

  updateAuthor: (composition, params) => {
    const {info} = composition;
    const {text} = params;
    return {
      ...composition,
      info: {
        ...info,
        author: text,
      },
    };
  },

  chat: (composition, params) => {
    let {chat} = composition;
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
        },
      ],
    };

    return {
      ...composition,
      chat,
    };
  },
};

export const reduce = (composition, action) => {
  const {type, params} = action;
  if (!(type in reducers)) {
    console.error('action', type, 'not found');
    return composition;
  }
  composition = reducers[type](composition, params);
  return composition;
};
