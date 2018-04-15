import { db, SERVER_TIME } from './firebase';
import EventEmitter from 'events';

// a wrapper class that models Game

const CURRENT_VERSION = '0.1';
export default class Game extends EventEmitter {
  constructor(path, options = {}) {
    super();
    const {
      events = true,
    } = options;

    this.path = path;
    this.ref = db.ref(path);
    if (events) {
      this.ref.on('value', snapshot => {
        this.emit('history', snapshot.val());
      });
    }
  }

  unload() {
    this.ref.off('value');
  }

  initialize(game) {
    const version = CURRENT_VERSION;
    this.ref.push({
      timestamp: SERVER_TIME,
      type: 'create',
      params: {
        version,
        game,
      },
    });
  }
}


