import Promise from 'bluebird';
import EventEmitter from 'events';
import _ from 'lodash';
import io from 'socket.io-client';
import * as uuid from 'uuid';
import * as colors from '../lib/colors';
import {emitAsync} from '../sockets/emitAsync';
import {getSocket} from '../sockets/getSocket';
import {db, SERVER_TIME} from './firebase';

Promise.promisifyAll(io);

// ============ Serialize / Deserialize Helpers ========== //

// Recursively walks obj and converts `null` to `undefined`
const castNullsToUndefined = (obj) => {
  if (_.isNil(obj)) {
    return undefined;
  }
  if (typeof obj === 'object') {
    return Object.assign(
      obj.constructor(),
      _.fromPairs(_.keys(obj).map((key) => [key, castNullsToUndefined(obj[key])]))
    );
  }
  return obj;
};

// a wrapper class that models Game

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
  async connectToWebsocket() {
    if (this.socket) return;
    const socket = await getSocket();
    this.socket = socket;
    await emitAsync(socket, 'join_game', this.gid);

    socket.on('disconnect', () => {
      console.log('received disconnect from server');
    });

    // handle future reconnects
    socket.on('connect', async () => {
      console.log('reconnecting...');
      await emitAsync(socket, 'join_game', this.gid);
      console.log('reconnected...');
      this.emitReconnect();
    });
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
    event.id = uuid.v4();
    this.emitOptimisticEvent(event);
    await this.connectToWebsocket();
    await this.pushEventToWebsocket(event);
  }

  pushEventToWebsocket(event) {
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
      const {url} = archiveInfo;
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

  reset(scope, force) {
    this.addEvent({
      timestamp: SERVER_TIME,
      type: 'reset',
      params: {
        scope,
        force,
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
    this.addEvent({
      timestamp: SERVER_TIME,
      type: 'sendChatMessage', // send to fencing too
      params: {
        message: text,
        id,
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
