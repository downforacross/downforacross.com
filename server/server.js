const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const EventEmitter = require('events');

const server = require('http').Server(app);
const io = require('socket.io')(server);
const _ = require('lodash');
const cors = require('cors');
const pg = require('pg');

// ======== HTTP Server Config ==========

io.origins('*:*'); // allow CORS for socket.io route
app.use(cors()); // allow CORS for all express routes

// ============= Database Operations ============

(async () => {})();

const getEventsKey = (gid) => {
  return `events_${gid}`;
};

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

  disconnect() {
    // not used
    return this.client.end();
  }

  async getEvents(gid) {
    if (!this.connected) throw new Error('not connected');
    console.log('[GameModel] listing events', gid);
    const res = await this.client.query('SELECT event_payload FROM game_events WHERE gid=$1', [gid]);
    console.log(res);
    // const serializedEvents = await client.lrangeAsync(getEventsKey(gid), 0, MAX_EVENTS);
    const events = _.map(res.rows, 'event_payload');
    return events;
  }

  async addEvent(gid, event) {
    if (!this.connected) throw new Error('not connected');
    console.log('[GameModel] Persisting event', gid, event);
    await this.client.query(
      `
      INSERT INTO game_events (gid, uid, ts, event_type, event_payload)
      VALUES ($1, $2, $3, $4, $5)`,
      [gid, event.user, new Date(event.timestamp).toISOString(), event.type, event]
    );
  }
}

// ============== Socket Manager ==============

class SocketManager extends EventEmitter {
  constructor(gameModel) {
    super();
    this.gameToSocket = new Map();
    this.socketToGame = new Map(); // Redundancy for sake of correctness
    this.gameModel = gameModel;
  }

  assignTimestamp(event) {
    if (event && typeof event === 'object') {
      if (event['.sv'] === 'timestamp') {
        return Date.now();
      }
      const result = event.constructor();
      for (const key in event) {
        result[key] = this.assignTimestamp(event[key]);
      }
      return result;
    }
    return event;
  }

  // Precondition: gid's game is "hot"
  async addEvent(gid, event) {
    this.emit('event', gid, event);
    event = this.assignTimestamp(event);

    // 1. save to DB
    this.gameModel.addEvent(gid, event);
    // 2. emit to all live clients

    if (this.gameToSocket.get(gid)) {
      this.gameToSocket.get(gid).forEach(async (socket) => {
        socket.emit('game_event', event);
      });
    }
  }

  getGameConnectionsCount(gid) {
    const connections = this.gameToSocket.get(gid);
    return connections ? connections.length : 0;
  }

  getTotalConnectionsCount() {
    return this.socketToGame.size;
  }

  getTotalGamesCount() {
    return this.gameToSocket.size;
  }

  listen() {
    io.on('connection', (socket) => {
      this.emit('connect', socket.id, socket.handshake.headers['x-real-ip']);
      socket.on('join', async (gid, ack) => {
        if (this.socketToGame.has(socket)) {
          throw new Error(
            `Socket ${socket.id} already joined ${this.socketToGame.get(socket)}, cannot join ${gid}`
          );
        }

        if (!this.gameToSocket.get(gid)) {
          this.gameToSocket.set(gid, []);
        }
        this.gameToSocket.get(gid).push(socket);
        this.socketToGame.set(socket, gid);

        socket.on('game_event', (message, cbk) => {
          this.addEvent(message.gid, message.event);
          cbk();
        });
        ack();
        this.emit('join', gid);
      });

      // Perform the "initial sync"
      socket.on('sync_all', async (gid, cbk) => {
        const events = await this.gameModel.getEvents(gid);
        cbk(events);
        this.emit('sync_all', gid, events);
      });

      socket.on('disconnect', () => {
        this.emit('disconnect', socket.id, socket.handshake.headers['x-real-ip']);
        if (!this.socketToGame.has(socket)) {
          return;
        }
        const gid = this.socketToGame.get(socket);
        this.socketToGame.delete(socket);
        if (this.gameToSocket.get(gid)) {
          _.remove(this.gameToSocket.get(gid), socket);
          if (!this.gameToSocket.get(gid).size) {
            this.gameToSocket.delete(gid);
          }
        }
      });
    });
  }

  emit(type, ...args) {
    super.emit('*', type, ...args);
    return super.emit(type, ...args) || super.emit('', ...args);
  }
}

// ============== End Socket Manager ==============

// ================== Begin Stats ====================

function getStatsForTimeWindow(socketManager, seconds) {
  const stats = {
    windowStart: Date.now(),
    prevCounts: {
      gameEvents: 0,
      activeGames: 0,
      bytesSent: 0,
      bytesReceived: 0,
      connections: 0,
    },
    counts: {
      gameEvents: 0,
      activeGames: 0,
      bytesSent: 0,
      bytesReceived: 0,
      connections: 0,
    },
    activeGids: [],
  };
  const activeGames = new Set();
  socketManager.on('event', (gid, event) => {
    stats.counts.gameEvents++;
    const bytes = JSON.stringify(event).length;
    stats.counts.bytesReceived += bytes;
    stats.counts.bytesSent += bytes * socketManager.getGameConnectionsCount(gid);
    if (!activeGames.has(gid)) {
      activeGames.add(gid);
      stats.counts.activeGames++;
      stats.activeGids.push(gid);
    }
  });

  socketManager.on('connect', (gid) => {
    stats.counts.connections += 1;
  });

  socketManager.on('sync_all', (gid, events) => {
    const bytes = JSON.stringify(events).length;
    stats.counts.bytesSent += bytes;
  });

  setInterval(() => {
    for (const key in stats.counts) {
      stats.prevCounts[key] = stats.counts[key];
      stats.counts[key] = 0;
    }
    activeGames.clear();
    stats.activeGids = [];
    stats.windowStart = Date.now();
  }, seconds * 1000);
  setInterval(() => {
    stats.percentComplete = (Date.now() - stats.windowStart) / (seconds * 1000);
  }, 500);
  return stats;
}

const STAT_DEFS = [
  {
    name: 'minute',
    secs: 60,
  },
  {
    name: 'hour',
    secs: 60 * 60,
  },
  {
    name: 'day',
    secs: 60 * 60 * 24,
  },
  {
    name: 'week',
    secs: 60 * 60 * 24 * 7,
  },
];

// ================== Logging ================

function logAllEvents(socketManager, log) {
  socketManager.on('*', (event, ...args) => {
    try {
      log(`[${event}]`, _.truncate(JSON.stringify(args), {length: 100}));
    } catch (e) {
      log(`[${event}]`, args);
    }
  });
}

// ================== Main Entrypoint ================

async function runServer() {
  const serverStartDate = new Date().toString();
  const gameModel = new GameModel();
  const socketManager = new SocketManager(gameModel);
  socketManager.listen();
  logAllEvents(socketManager, console.log);

  const timeWindowStats = STAT_DEFS.map(({name, secs}) => ({
    name,
    stats: getStatsForTimeWindow(socketManager, secs),
  }));
  app.get('/test', (req, res) => res.send('Hello World!'));
  app.get('/api/stats', (req, res) => {
    const liveStats = {
      serverStartDate,
      gamesCount: socketManager.getTotalGamesCount(),
      connectionsCount: socketManager.getTotalConnectionsCount(),
    };
    const stats = {
      liveStats,
      timeWindowStats,
    };
    res.status(200).json(stats);
  });
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
