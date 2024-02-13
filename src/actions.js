import {gameWords} from './lib/names';
import {makeGrid} from './lib/gameUtils';
import firebase from './store/firebase';
// eslint-disable-next-line import/no-cycle
import {GameModel, PuzzleModel} from './store';
import {incrementGid, incrementPid} from './api/counters';

// for interfacing with firebase

const db = firebase.database();
function disconnect() {
  // no-op for now
}

const actions = {
  // puzzle: { title, type, grid, clues }
  createPuzzle: async (puzzle, cbk) => {
    const {pid} = await incrementPid();
    cbk && cbk(pid);
  },

  getNextGid: async (cbk) => {
    const {gid} = await incrementGid();
    const word = gameWords[Math.floor(Math.random() * gameWords.length)];
    cbk(`${gid}-${word}`);
  },

  getNextBid: (cbk) => {
    // Copying Cid logic for now...
    const NUM_BIDS = 100000000;
    const bid = Math.floor(Math.random() * NUM_BIDS);
    cbk(bid);
  },

  getNextCid: (cbk) => {
    const NUM_CIDS = 1000000;
    for (let tries = 0; tries < 10; tries += 1) {
      const cid = `${NUM_CIDS + Math.floor(Math.random() * NUM_CIDS)}`.substring(1);
      cbk(cid);
    }
  },

  // TODO: this should probably be createGame and the above should be deleted but idk what it does...
  createGameForBattle: ({pid, battleData}, cbk) => {
    actions.getNextGid((gid) => {
      const game = new GameModel(`/game/${gid}`);
      const puzzle = new PuzzleModel(`/puzzle/${pid}`);
      puzzle.attach();
      puzzle.once('ready', () => {
        const rawGame = puzzle.toGame();
        game.initialize(rawGame, {battleData}).then(() => {
          cbk && cbk(gid);
        });
      });
    });
  },

  createComposition: (dims, pattern, cbk) => {
    const type = Math.max(dims.r, dims.c) <= 7 ? 'Mini Puzzle' : 'Daily Puzzle';
    const textGrid = pattern.map((row) => row.map((cell) => (cell === 0 ? '' : '.')));
    const grid = makeGrid(textGrid);
    const composition = {
      info: {
        title: 'Untitled',
        type,
        author: 'Anonymous',
      },
      grid: grid.toArray(),
      clues: grid.alignClues([]),
      published: false,
    };
    const cid = db.ref('composition').push().key;
    db.ref(`composition/${cid}`).set(composition, () => {
      cbk(cid);
    });
  },
};

export {db, disconnect};
export default actions;
