import { db, SERVER_TIME } from './firebase';
import EventEmitter from 'events';

// a wrapper class that models Game

const CURRENT_VERSION = '0.1';
export default class Game extends EventEmitter {
  constructor(path) {
    super();
    this.path = path;
    this.ref = db.ref(path);
  }

  attach() {
    this.ref.on('child_added', snapshot => {
      this.emit('event', snapshot.val());
    });
  }

  detach() {
    this.ref.off('value');
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


