import EventEmitter from 'events';
import io from 'socket.io-client';

import {db, SERVER_TIME} from './firebase';

import Puzzle from './puzzle';
import * as colors from '../lib/colors';

const SOCKET_HOST = 'localhost:3020/'; // TODO different in prod
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

  // Websocket code
  connectToWebsocket() {
    if (!this.websocketPromise) {
      console.log('entering connectToWebsocket');
      const socket = io(SOCKET_HOST);
      this.socket = socket;
      window.socket = socket;

      console.log('exiting connectToWebsocket');
      this.websocketPromise = new Promise((resolve) => socket.on('connect', resolve));
    }
    return this.websocketPromise;
  }

  addEvent(event) {
    this.events.push(event);
    if (this.socket) {
      this.connectToWebsocket().then(() => {
        this.pushEventToWebsocket();
      });
    }
  }

  pushEventToWebsocket() {
    if (!this.socket || !this.socket.connected) {
      throw new Error('Not connected to websocket');
    }
  }

  subscribeToWebsocketEvents() {
    if (!this.socket || !this.socket.connected) {
      throw new Error('Not connected to websocket');
    }
    console.log('subscribing to ws events');
    this.socket.on('game_event', (event) => {
      console.log('got game_event', event);

      if (false) {
        console.log('[WS] createEvent', event);
        console.log('[WS] event', event);
      }
    });
  }

  // Firebase Code

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
        return;
      }
      const {url, unarchivedAt} = archiveInfo;
      if (unarchivedAt) {
      }
      if (url) {
        const events = await (await fetch(url)).json();
        this.ref.child('archivedEvents/unarchivedAt').set(SERVER_TIME);
        this.ref.child('events').set(events);
      }
    });
  }

  subscribeToFirebaseEvents() {
    this.events.on('child_added', (snapshot) => {
      const event = snapshot.val();
      if (event.type === 'create') {
        this.attached = true;
        this.createEvent = event;
        this.subscribeToPuzzle();
        console.debug('[FB] createEvent', event);
        this.emit('createEvent', event);
      } else {
        console.debug('[FB] event', event);
        this.emit('event', event);
      }
    });
  }

  attach() {
    this.subscribeToFirebaseEvents(); // TODO only subscribe to websocket
    this.ref.child('battleData').on('value', (snapshot) => {
      this.emit('battleData', snapshot.val());
    });
    this.connectToWebsocket().then(() => {
      this.subscribeToWebsocketEvents();
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
    this.addEvent({
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
    this.addEvent({
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
    this.addEvent({
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
    this.addEvent({
      timestamp: SERVER_TIME,
      type: 'updateDisplayName',
      params: {
        id,
        displayName,
      },
    });
  }

  updateColor(id, color) {
    this.addEvent({
      timestamp: SERVER_TIME,
      type: 'updateColor',
      params: {
        id,
        color,
      },
    });
  }

  updateClock(action) {
    this.addEvent({
      timestamp: SERVER_TIME,
      type: 'updateClock',
      params: {
        action,
        timestamp: SERVER_TIME,
      },
    });
  }

  check(scope) {
    this.addEvent({
      timestamp: SERVER_TIME,
      type: 'check',
      params: {
        scope,
      },
    });
  }

  reveal(scope) {
    this.addEvent({
      timestamp: SERVER_TIME,
      type: 'reveal',
      params: {
        scope,
      },
    });
  }

  reset(scope) {
    this.addEvent({
      timestamp: SERVER_TIME,
      type: 'reset',
      params: {
        scope,
      },
    });
  }

  chat(username, id, text) {
    this.addEvent({
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
      this.addEvent({
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
