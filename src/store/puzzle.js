import { db, SERVER_TIME } from './firebase';
import EventEmitter from 'events';
import { makeGame } from '../gameUtils';

// a wrapper class that models Puzzle

export default class Puzzle extends EventEmitter {
  constructor(path) {
    super();
    this.ref = db.ref(path);
  }

  attach() {
    this.ref.once('value', snapshot => {
      this.puzzle = snapshot.val();
      this.emit('ready');
    });
  }

  toGame() {
    // TODO rewrite makeGame in here
    return makeGame(undefined, undefined, this.puzzle);
  }
}
