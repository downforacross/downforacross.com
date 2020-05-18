import EventEmitter from 'events';
import io from 'socket.io-client';
import Promise from 'bluebird';
import uuid from 'uuid';
import _ from 'lodash';

import {db, SERVER_TIME} from './firebase';
import Puzzle from './puzzle';
import * as colors from '../lib/colors';
Promise.promisifyAll(io);

// ============ Serialize / Deserialize Helpers ========== //

// Recursively walks obj and converts `null` to `undefined`
const castNullsToUndefined = (obj) => {
  if (_.isNil(obj)) {
    return undefined;
  } else if (typeof obj === 'object') {
    return Object.assign(
      obj.constructor(),
      _.fromPairs(_.keys(obj).map((key) => [key, castNullsToUndefined(obj[key])]))
    );
  } else {
    return obj;
  }
};

const SOCKET_HOST_HTTPS = 'https://downforacross.com';
const SOCKET_HOST_HTTP = '54.151.18.249:3021';
const SOCKET_HOST = window.location.protocol === 'https:' ? SOCKET_HOST_HTTPS : SOCKET_HOST_HTTP;
// a wrapper class that models Game

const emitAsync = (socket, ...args) => new Promise((resolve) => socket.emit(...args, resolve));

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

  get gid() {
    // NOTE: path is a string that looks like "/game/39-vosk"
    return this.path.substring(6);
  }

  // Websocket code
  connectToWebsocket() {
    if (!this.websocketPromise) {
      this.websocketPromise = (async () => {
        const socket = io(SOCKET_HOST);
        this.socket = socket;
        window.socket = socket;

        await this.socket.onceAsync('connect');
        await emitAsync(this.socket, 'join', this.gid);
      })();
    }
    return this.websocketPromise;
  }

  emitEvent(event) {
    console.log('event', event);
    this.emit(event.type === 'create' ? 'createEvent' : 'event', event);
  }

  emitOptimisticEvent(event) {
    this.emit('optimisticEvent', event);
  }

  async addEvent(event) {
    event.id = uuid.v4();
    // this.events.push(event);
    if (this.socket) {
      this.emitOptimisticEvent(event);
      await this.connectToWebsocket();
      console.log('start');
      await this.pushEventToWebsocket(event);
      console.log('done');
    }
  }

  pushEventToWebsocket(event) {
    if (!this.socket || !this.socket.connected) {
      throw new Error('Not connected to websocket');
    }

    return emitAsync(this.socket, 'game_event', {
      event,
      gid: this.gid,
    });
  }

  async subscribeToWebsocketEvents() {
    if (!this.socket || !this.socket.connected) {
      throw new Error('Not connected to websocket');
    }
    this.attached = true;

    await this.socket.on('game_event', (event) => {
      event = castNullsToUndefined(event);
      this.emitEvent(event);
    });
    const response = await emitAsync(this.socket, 'sync_all', this.gid);
    response.forEach((event) => {
      event = castNullsToUndefined(event);
      this.emitEvent(event);
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
        this.emit('createEvent', event);
      } else {
        this.emit('event', event);
      }
    });
  }

  attach() {
    // this.subscribeToFirebaseEvents(); // TODO only subscribe to websocket
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

  async initialize(rawGame, battleData, cbk) {
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

    await this.events.set({});
    await this.connectToWebsocket();
    await this.addEvent({
      timestamp: SERVER_TIME,
      type: 'create',
      params: {
        pid,
        version,
        game,
      },
    });
    cbk && cbk();
    this.ref.child('pid').set(pid);

    if (battleData) {
      this.ref.child('battleData').set(battleData);
    }
  }
}
