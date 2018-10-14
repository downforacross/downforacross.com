import {db, SERVER_TIME} from './firebase';
import EventEmitter from 'events';

import Puzzle from './puzzle';

// a wrapper class that models Game

const CURRENT_VERSION = 1.0;
export default class Game extends EventEmitter {
  constructor(path) {
    super();
    this.path = path;
    this.ref = db.ref(path);
    this.events = this.ref.child('events');
    this.createEvent = null;
    this.attached = false;
  }

  attach() {
    this.events.on('child_added', (snapshot) => {
      const event = snapshot.val();
      if (event.type === 'create') {
        this.attached = true;
        this.createEvent = event;
        this.subscribeToPuzzle();
        this.emit('createEvent', event);
      } else {
        this.emit('event', event);
      }
    });
  }

  detach() {
    this.events.off('child_added');
  }

  subscribeToPuzzle() {
    if (!this.createEvent) return;
    const {pid} = this.createEvent.params;
    if (!pid) return;
    const puzzle = new Puzzle(`/puzzle/${pid}`, pid);
    puzzle.on('ready', () => {
      const event = {
        ...this.createEvent,
        params: {
          ...this.createEvent.params,
          game: puzzle.toGame(),
        },
      };
      this.createEvent = event;
      this.emit('createEvent', event);
    });
    puzzle.attach();
  }

  updateCell(r, c, id, color, pencil, value) {
    this.events.push({
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

  updateCursor(r, c, id) {
    this.events.push({
      timestamp: SERVER_TIME,
      type: 'updateCursor',
      params: {
        timestamp: SERVER_TIME,
        cell: {r, c},
        id,
      },
    });
  }

  updateColor(id, color) {
    this.events.push({
      timestamp: SERVER_TIME,
      type: 'updateColor',
      params: {
        id,
        color,
      },
    });
  }

  updateClock(action) {
    this.events.push({
      timestamp: SERVER_TIME,
      type: 'updateClock',
      params: {
        action,
        timestamp: SERVER_TIME,
      },
    });
  }

  check(scope) {
    this.events.push({
      timestamp: SERVER_TIME,
      type: 'check',
      params: {
        scope,
      },
    });
  }

  reveal(scope) {
    this.events.push({
      timestamp: SERVER_TIME,
      type: 'reveal',
      params: {
        scope,
      },
    });
  }

  reset(scope) {
    this.events.push({
      timestamp: SERVER_TIME,
      type: 'reset',
      params: {
        scope,
      },
    });
  }

  chat(username, id, text) {
    this.events.push({
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
      grid = [[{}]],
      solution = [['']],
      circles = [],
      chat = {messages: []},
      cursor = {},
      clues = {},
      clock = {
        lastUpdated: 0,
        totalTime: 0,
        paused: true,
      },
      solved = false,
      pid,
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
    // nuke existing events
    this.events.set({}).then(() => {
      this.events.push({
        timestamp: SERVER_TIME,
        type: 'create',
        params: {
          pid,
          version,
          game,
        },
      });
    });
    this.ref.child('pid').set(pid);
  }
}
