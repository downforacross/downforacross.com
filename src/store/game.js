import { db, SERVER_TIME } from './firebase';
import EventEmitter from 'events';

// a wrapper class that models Game

const CURRENT_VERSION = 1.0;
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
    this.ref.off('child_added');
  }

  updateCell(r, c, id, color, pencil, value) {
    this.ref.push({
      timestamp: SERVER_TIME,
      type: 'updateCell',
      params: {
        cell: {r, c},
        value,
        color,
        pencil,
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

  chat(username, id, text) {
    this.ref.push({
      timestamp: SERVER_TIME,
      type: 'chat',
      params: {
        text,
        senderId: id,
        sender: username,
      },
    });
  }

  initialize(rawGame) {
    const {
      info = {},
      grid = [ [ {} ] ],
      solution = [ [ '' ] ],
      circles = [],
      chat = { messages: [] },
      cursor = {},
      clues = {},
      clock = {
        lastUpdated: 0,
        totalTime: 0,
        paused: true,
      },
      solved = false,
    } = rawGame;

    // TODO validation

    const game = {
      info,
      grid,
      solution,
      circles,
      chat,
      cursor,
      clues,
      clock,
      solved,
    };
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
