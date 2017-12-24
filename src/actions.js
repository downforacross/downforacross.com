import { makeGame } from './gameUtils';
import firebase, { app } from './store/firebase';

// for interfacing with firebase

const db = firebase.database();
function disconnect() {
  app.delete();
}

const offsetRef = firebase.database().ref(".info/serverTimeOffset");
let offset = 0;
offsetRef.once('value', result => {
  offset = result.val();
});

function getTime() {
  return new Date().getTime() + offset;
}

const actions = {
  // puzzle: { title, type, grid, clues }
  createPuzzle: (puzzle, cbk) => {
    db.ref('counters').transaction(counters => {
      const pid = ((counters && counters.pid) || 0) + 1;
      const title = puzzle.info.title;
      const author = puzzle.info.author;
      puzzle.pid = pid;
      db.ref('puzzlelist/' + pid).set({
        pid: pid,
        info: puzzle.info,
        title: title,
        private: puzzle.private || false,
        author: author,
        importedTime: getTime(),
      });
      db.ref('puzzle/' + pid).set(puzzle);
      return {...counters, pid: pid}
    }, (err, success, snapshot) => {
      cbk && cbk(snapshot.val());
    });
  },

  createGame: ({ name, pid, gid }, cbk) => {
    db.ref('counters').transaction(counters => {
      let nextGid = ((counters && counters.gid) || 0);
      if (!gid) { // then auto-assign the next one by incrementing
        nextGid += 1; // if this isn't an int we are fucked lol
      }
      return {
        ...counters,
        gid: nextGid
      };
    }, (error, committed, snapshot) => {
      if (error || !committed) {
        console.error('could not create game');
        return;
      }
      if (!gid) { // auto assign the result of our increment
        // should be atomic or something
        gid = snapshot.child('gid').val();
      }
      db.ref('puzzle/' + pid).once('value', puzzle => {
        const game = makeGame(gid, name, puzzle.val());
        db.ref('game/' + gid).set(game);
      });
      cbk && cbk(gid);
    });
  }
};

export { db, getTime, disconnect };
export default actions;
