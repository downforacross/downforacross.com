const express = require('express');
const app = express();
const morgan = require('morgan');

const port = process.env.PORT || 3000;

const server = require('http').Server(app);
const io = require('socket.io')(server, {pingInterval: 2000, pingTimeout: 5000});
const _ = require('lodash');
const cors = require('cors');
const pg = require('pg');

// ======== HTTP Server Config ==========

io.origins('*:*'); // allow CORS for socket.io route
app.use(cors()); // allow CORS for all express routes
app.use(morgan('combined'));
// ============= Database Operations ============

const MAX_EVENTS = 1e7;
class GameModel {
  constructor() {
    this.client = new pg.Client({
      host: process.env.PGHOST || 'localhost',
      user: process.env.PGUSER || process.env.USER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
    });
    this.connecting = false;
  }

  async connect() {
    if (this.connected || this.connecting) return;
    this.connecting = true;
    await this.client.connect();
    this.connecting = false;
    this.connected = true;
  }

  async getEvents(gid) {
    if (!this.connected) throw new Error('not connected');
    const startTime = Date.now();
    const res = await this.client.query('SELECT event_payload FROM game_events WHERE gid=$1', [gid]);
    const events = _.map(res.rows, 'event_payload');
    const ms = Date.now() - startTime;
    console.log(`getEvents(${gid}) took ${ms}ms`);
    return events;
  }

  async addEvent(gid, event) {
    if (!this.connected) throw new Error('not connected');
    const startTime = Date.now();
    await this.client.query(
      `
      INSERT INTO game_events (gid, uid, ts, event_type, event_payload)
      VALUES ($1, $2, $3, $4, $5)`,
      [gid, event.user, new Date(event.timestamp).toISOString(), event.type, event]
    );
    const ms = Date.now() - startTime;
    console.log(`addEvent(${gid}, ${event.type}) took ${ms}ms`);
  }
}

// ============= Server Values ===========

// Look for { .sv: 'timestamp' } and relpcae with Date.now()
function assignTimestamp(event) {
  if (event && typeof event === 'object') {
    if (event['.sv'] === 'timestamp') {
      return Date.now();
    }
    const result = event.constructor();
    for (const key in event) {
      result[key] = assignTimestamp(event[key]);
    }
    return result;
  }
  return event;
}

// ============== Socket Manager ==============

class SocketManager {
  constructor(gameModel) {
    this.gameModel = gameModel;
  }

  async addEvent(gid, event) {
    event = assignTimestamp(event);

    await this.gameModel.addEvent(gid, event);
    io.to(`game-${gid}`).emit('game_event', event);
  }

  getLiveSocketsCount() {
    return _.keys(io.sockets.sockets).length;
  }

  listen() {
    io.on('connection', (socket) => {
      socket.on('join', async (gid, ack) => {
        socket.join(`game-${gid}`);
        ack();
      });

      socket.on('sync_all', async (gid, ack) => {
        const events = await this.gameModel.getEvents(gid);
        ack(events);
      });

      socket.on('game_event', async (message, ack) => {
        await this.addEvent(message.gid, message.event);
        ack();
      });
    });
  }
}

// ================== Logging ================

function logAllEvents(socketManager, log) {
  io.on('*', (event, ...args) => {
    try {
      log(`[${event}]`, _.truncate(JSON.stringify(args), {length: 100}));
    } catch (e) {
      log(`[${event}]`, args);
    }
  });
}

// ================== Main Entrypoint ================

async function runServer() {
  const gameModel = new GameModel();
  const socketManager = new SocketManager(gameModel);
  socketManager.listen();
  logAllEvents(socketManager, console.log);
  console.log(
    'connecting to database...',
    process.env.PGDATABASE,
    process.env.PGUSER,
    process.env.PGPASSWORD
  );
  await gameModel.connect();
  console.log('connected to database...');
  server.listen(port, () => console.log(`Listening on port ${port}`));
}

runServer();
