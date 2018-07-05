import DemoGame from './demoGame';
import { db, SERVER_TIME, offline } from './firebase';
import EventEmitter from 'events';

// a wrapper class that models Game

const CURRENT_VERSION = '0.1';
class Game extends EventEmitter {
  constructor(path) {
    super();
    this.path = path;
    this.ref = db.ref(path);
  }

  attach() {
    console.log('attached to game', this.path);
    this.ref.on('child_added', snapshot => {
      console.log('event', snapshot.val());
      this.emit('event', snapshot.val());
    });
  }

  detach() {
    this.ref.off('child_added');
  }

  updateCell(r, c, id, color, value) {
    this.ref.push({
      timestamp: SERVER_TIME,
      type: 'updateCell',
      params: {
        cell: {r, c},
        value,
        color,
        id,
      },
    });
  }

  updateCursor(r, c, id, color) {
    this.ref.push({
      timestamp: SERVER_TIME,
      type: 'updateCursor',
      params: {
        timestamp: SERVER_TIME,
        cell: {r, c},
        color,
        id,
      },
    });
  }

  updateClock(action) {
    this.ref.push({
      timestamp: SERVER_TIME,
      type: 'updateClock',
      params: {
        action,
        timestamp: SERVER_TIME,
      },
    });
  }

  check(scope) {
    this.ref.push({
      timestamp: SERVER_TIME,
      type: 'check',
      params: {
        scope,
      },
    });
  }

  reveal(scope) {
    this.ref.push({
      timestamp: SERVER_TIME,
      type: 'reveal',
      params: {
        scope,
      },
    });
  }

  reset(scope) {
    this.ref.push({
      timestamp: SERVER_TIME,
      type: 'reset',
      params: {
        scope,
      },
    });
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

export default (offline ? DemoGame : Game);
