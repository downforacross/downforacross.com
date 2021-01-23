// moves the puzzles to postgres from firebase
// npx babel-node  backfills/uploadExistingPuzzlesToPostgres.js

import PuzzleList from '../src/store/puzzlelist';
import Puzzle from '../src/store/puzzle';

// All of this was copy pasted as I could not get my local node to reinterpret
// use the env vars to write to the db you want (either your local box or the actual dbs).
// and to control what you read from
const REMOTE_SERVER =
  process.env.NODE_ENV === 'development' ? 'api-staging.foracross.com' : 'api.foracross.com';
const REMOTE_SERVER_URL = `http://${REMOTE_SERVER}`;

const SERVER_URL = process.env.WRITE_TO_REMOTE ? REMOTE_SERVER_URL : 'http://localhost:3021';

const fetch = require('node-fetch');
async function createNewPuzzle(puzzle, pid, opts) {
  const url = `${SERVER_URL}/api/puzzle`;
  const data = {
    puzzle,
    pid,
    isPublic: !!opts.isPublic,
  };
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return resp.json();
}
// END COPY_PASTED

let firebasePuzzleList = new PuzzleList();
//
async function f() {
  await firebasePuzzleList.ref.once('value', async (snapshot) => {
    const puzzleArray = Object.assign([], snapshot.val());
    console.log(puzzleArray);
    for (const puzzle_stat of puzzleArray) {
      if (!puzzle_stat) {
        continue;
      }

      const pid = puzzle_stat.pid;
      const stats = puzzle_stat.stats || {};
      const puzzleFromFirebase = new Puzzle(`/puzzle/${pid}`).ref.once('value', async (puzzleSnapshot) => {
        const puzzleVal = Object.assign({}, puzzleSnapshot.val());
        delete puzzleVal.pid;
        delete puzzleVal.private;
        if (!(puzzleVal.clues.across instanceof Array)) {
          console.log(`skipping ${pid}`);
          return;
        }
        let response = await createNewPuzzle(puzzleVal, pid, {isPublic: !puzzle_stat.private});
        console.log(response);
      });
      // await createNewPuzzle(puzzle, pid, {
      //   isPublic: !puzzle_stat.private,
      // });
      // console.log(`pid ${pid} stats ${JSON.stringify(stats)}`);
    }
    console.log('processed, you may exit');
  });
}
f();
export {};
