import EventEmitter from 'events';
import _ from 'lodash';
import {db, getTime} from './firebase';
import {makeGrid} from '../lib/gameUtils';

// a wrapper class that models Puzzle

export default class Puzzle extends EventEmitter {
  constructor(path, pid) {
    super();
    this.ref = db.ref(path);
    this.pid = pid;
  }

  attach() {
    this.ref.on('value', (snapshot) => {
      this.data = snapshot.val();
      this.emit('ready');
    });
  }

  detach() {
    this.ref.off('value');
  }

  logSolve(gid, stats) {
    const statsPath = `/stats/${this.pid}`;
    const statsRef = db.ref(statsPath);
    const puzzlelistPath = `/puzzlelist/${this.pid}`;
    const puzzlelistRef = db.ref(puzzlelistPath);
    statsRef.child('solves').child(gid).set(stats);
    statsRef.once('value').then((snapshot) => {
      const stats = snapshot.val();
      const numSolves = _.keys(stats.solves).length;
      puzzlelistRef.child('stats/numSolves').set(numSolves);
    });
  }

  toGame() {
    debugger;
    const {info, circles = [], shades = [], grid: solution, pid} = this.data;
    const gridObject = makeGrid(solution);
    const clues = gridObject.alignClues(this.data.clues);
    const grid = gridObject.toArray();

    const game = {
      info,
      circles,
      shades,
      clues,
      solution,
      pid,
      grid,
      createTime: getTime(),
      startTime: null,
      chat: {
        users: [],
        messages: [],
      },
    };
    return game;
  }

  get info() {
    if (!this.data) return undefined;
    return this.data.info;
  }

  // return list of games that were played off this puzzle
  // includes beta games, but not solo games
  listGames(limit = 100) {
    return db
      .ref('/game')
      .orderByChild('pid')
      .equalTo(this.pid)
      .limitToLast(limit)
      .once('value')
      .then((snapshot) => snapshot.val());
  }
}
