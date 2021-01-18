import EventEmitter from 'events';
import io from 'socket.io-client';
import Promise from 'bluebird';
import uuid from 'uuid';
import _ from 'lodash';
import {SOCKET_HOST} from '../api/constants';
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

// a wrapper class that models Game

const emitAsync = (socket, ...args) =>
  new Promise((resolve) => {
    socket.emit(...args, resolve);
  });

const CURRENT_VERSION = 1.0;
export default class Game extends EventEmitter {
  constructor(path) {
    super();
    window.game = this;
    this.path = path;
    this.ref = db.ref(path);
    this.eventsRef = this.ref.child('events');
    this.createEvent = null;
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
        // Note: In attempt to increase websocket limit, use upgrade false
        // https://stackoverflow.com/questions/15872788/maximum-concurrent-socket-io-connections
        const socket = io(SOCKET_HOST, {upgrade: false, transports: ['websocket']});

        this.socket = socket;
        window.socket = socket;

        socket.on('pong', function (ms) {
          window.connectionStatus = {
            latency: ms,
            timestamp: Date.now(),
          };
        });

        socket.on('connect', (event) => {
          console.debug('[ws connect]', event);
        });
        socket.on('connect', (event) => {
          console.debug('[ws connect]', event);
        });
        socket.on('ping', (event) => {
          console.debug('[ws ping]', Date.now());
        });
        socket.on('pong', (event) => {
          console.debug('[ws pong]', Date.now());
        });

        console.log('Connecting to', SOCKET_HOST);
        await this.socket.onceAsync('connect');
        await emitAsync(this.socket, 'join', this.gid);

        this.socket.on('disconnect', () => {
          console.log('received disconnect from server');
          this.disconnected = true;
        });

        // handle future reconnects
        this.socket.on('connect', async () => {
          console.log('reconnecting...');
          await emitAsync(this.socket, 'join', this.gid);
          console.log('reconnected...');
          this.emitReconnect();
        });
      })();
    }
    return this.websocketPromise;
  }

  emitEvent(event) {
    if (event.type === 'create') {
      this.emit('createEvent', event);
    } else {
      this.emit('event', event);
    }
  }

  emitWSEvent(event) {
    if (event.type === 'create') {
      this.emit('wsCreateEvent', event);
      console.log('Connected!');
      console.log(event);
    } else {
      this.emit('wsEvent', event);
    }
  }

  emitOptimisticEvent(event) {
    this.emit('wsOptimisticEvent', event);
  }

  emitReconnect() {
    this.emit('reconnect');
  }

  async addEvent(event) {
    console.log('add event', event);
    event.id = uuid.v4();
    this.emitOptimisticEvent(event);
    await this.connectToWebsocket();
    await this.pushEventToWebsocket(event);
  }

  pushEventToWebsocket(event) {
    console.log('push to ws', event);
    if (!this.socket || !this.socket.connected) {
      this.socket && this.socket.close().open(); // HACK try to fix the disconnection bug
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

    this.socket.on('game_event', (event) => {
      event = castNullsToUndefined(event);
      this.emitWSEvent(event);
    });
    const response = await emitAsync(this.socket, 'sync_all_game_events', this.gid);
    response.forEach((event) => {
      event = castNullsToUndefined(event);
      this.emitWSEvent(event);
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

  async attach() {
    this.ref.child('battleData').on('value', (snapshot) => {
      this.emit('battleData', snapshot.val());
    });

    console.log('subscribed');

    const websocketPromise = this.connectToWebsocket().then(() => this.subscribeToWebsocketEvents());
    await websocketPromise;
  }

  detach() {
    this.eventsRef.off('child_added');
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

  updateCellAutocheck(r, c, id, color, pencil, value) {
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
    this.addEvent({
      timestamp: SERVER_TIME,
      type: 'check',
      params: {
        scope: [{r, c}],
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

  async initialize(rawGame, {battleData} = {}) {
    console.log('initialize');
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

    this.ref.child('pid').set(pid);
    await this.eventsRef.set({});
    await this.addEvent({
      timestamp: SERVER_TIME,
      type: 'create',
      params: {
        pid,
        version,
        game,
      },
    });

    if (battleData) {
      this.ref.child('battleData').set(battleData);
    }
  }
}
