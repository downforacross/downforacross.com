import EventEmitter from 'events';
import {db, SERVER_TIME} from './firebase';

import Puzzle from './puzzle';
import * as colors from '../lib/colors';

// a wrapper class that models Game

const CURRENT_VERSION = 1.0;
export default class Game extends EventEmitter {
  constructor(path) {
    super();
    window.game = this;
    this.path = path;
    this.ref = db.ref(path);
    this.events = this.ref.child('events');
    this.createEvent = null;
    this.attached = false;
    this.checkArchive();
  }

  checkArchive() {
    this.ref.child('archivedEvents').once('value', (snapshot) => {
      const archiveInfo = snapshot.val();
      if (!archiveInfo) {
        return;
      }
      const {unarchivedAt} = archiveInfo;
      if (!unarchivedAt) {
        if (window.confirm('Unarchive game?')) {
          this.unarchive();
        }
      }
    });
  }

  unarchive() {
    this.ref.child('archivedEvents').once('value', async (snapshot) => {
      const archiveInfo = snapshot.val();
      if (!archiveInfo) {
        console.log('nothing to unarchive');
        return;
      }
      const {url, count, archivedAt, unarchivedAt} = archiveInfo;
      if (unarchivedAt) {
        console.log('already unarchived at', unarchivedAt);
      }
      if (url) {
        console.log('loading', count, ' events from', archivedAt);
        console.log(url);
        const events = await (await fetch(url)).json();
        console.log(events);
        console.log('populating realtime database with new /events');
        this.ref.child('archivedEvents/unarchivedAt').set(SERVER_TIME);
        this.ref.child('events').set(events);
      }
    });
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
    this.ref.child('battleData').on('value', (snapshot) => {
      this.emit('battleData', snapshot.val());
    });
  }

  detach() {
    this.events.off('child_added');
  }

  subscribeToPuzzle() {
    if (!this.createEvent) return;
    const {pid} = this.createEvent.params;
    if (!pid) return;
    this.puzzleModel = new Puzzle(`/puzzle/${pid}`, pid);
    this.puzzleModel.on('ready', () => {
      const event = {
        ...this.createEvent,
        params: {
          ...this.createEvent.params,
          game: this.puzzleModel.toGame(),
        },
      };
      this.createEvent = event;
      this.emit('createEvent', event);
    });
    this.puzzleModel.attach();
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

  addPing(r, c, id) {
    this.events.push({
      timestamp: SERVER_TIME,
      type: 'addPing',
      params: {
        timestamp: SERVER_TIME,
        cell: {r, c},
        id,
      },
    });
  }

  updateDisplayName(id, displayName) {
    this.events.push({
      timestamp: SERVER_TIME,
      type: 'updateDisplayName',
      params: {
        id,
        displayName,
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

  initialize(rawGame, battleData, cbk) {
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
      themeColor = colors.MAIN_BLUE_3,
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
      themeColor,
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

    if (battleData) {
      this.ref.child('battleData').set(battleData);
    }

    cbk && cbk();
  }
}
