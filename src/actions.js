import {gameWords} from './lib/names';
import {makeGrid} from './lib/gameUtils';
import firebase, {getTime} from './store/firebase';
import {GameModel, PuzzleModel} from './store';

// for interfacing with firebase

const db = firebase.database();
function disconnect() {
  // no-op for now
}

function setPuzzle(pid, puzzle) {
  const {info, private: private_ = false} = puzzle;
  const {title, author} = info;
  db.ref(`puzzlelist/${pid}`).set({
    pid,
    info,
    title,
    private: private_,
    author,
    importedTime: getTime(),
    stats: {
      solves: {},
      numSolves: 0,
    },
  });
  db.ref(`puzzle/${pid}`).set({
    ...puzzle,
    pid,
  });
}

const actions = {
  updatePuzzle: (pid, puzzle) => {
    setPuzzle(pid, puzzle);
  },
  // puzzle: { title, type, grid, clues }
  createPuzzle: (puzzle, cbk) => {
    db.ref('counters').transaction(
      (counters) => {
        const pid = ((counters && counters.pid) || 0) + 1;
        return {...counters, pid};
      },
      (err, success, snapshot) => {
        const pid = snapshot.child('pid').val();
        setPuzzle(pid, puzzle);
        cbk && cbk(pid);
      }
    );
  },

  getNextGid: (cbk) => {
    db.ref('counters').transaction(
      (counters) => {
        const gid = (counters && counters.gid) || 0;
        return {
          ...counters,
          gid: gid + 1,
        };
      },
      (error, committed, snapshot) => {
        const gid = snapshot.child('gid').val();
        const word = gameWords[Math.floor(Math.random() * gameWords.length)];
        cbk(`${gid}-${word}`);
      }
    );
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
    db.ref(`composition/${cid}`).set(composition, (error) => {
      cbk(cid);
    });
  },

  makePrivate: (pid) => {
    db.ref(`puzzlelist/${pid}/private`).set(true);
  },

  makePublic: (pid) => {
    db.ref(`puzzlelist/${pid}/private`).set(false);
  },
};

export {db, disconnect};
export default actions;
