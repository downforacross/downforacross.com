import EventEmitter from 'events';

import {db} from './firebase';
import {makeGame} from '../gameUtils';

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

  toGame() {
    // TODO rewrite makeGame in here
    return makeGame(undefined, undefined, this.data);
  }

  get info() {
    if (!this.data) return;
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
