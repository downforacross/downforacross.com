const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const EventEmitter = require('events');

const server = require('http').Server(app);
const io = require('socket.io')(server);
const _ = require('lodash');
const cors = require('cors');

const Promise = require('bluebird');
const redis = require('redis');
Promise.promisifyAll(redis);

// ======== HTTP Server Config ==========

io.origins('*:*'); // allow CORS for socket.io route
app.use(cors()); // allow CORS for all express routes

// ======== Redis Config ===========

let redisOptions;
if (process.env.REDIS_HOST) {
  console.log(`Connecting to redis @ ${process.env.REDIS_HOST}`);
  redisOptions = {
    host: process.env.REDIS_HOST,
  };
}
const client = redis.createClient(redisOptions);

// ============= Database Operations ============

// TODO redis should not contain more than ~10 MB (which is > 100 concurrent games)
// Back it w/ S3

const getEventsKey = (gid) => {
  return `events_${gid}`;
};

const MAX_EVENTS = 1e7;

class GameModel {
  // throws error if db is corrupted!
  async getEvents(gid) {
    const serializedEvents = await client.lrangeAsync(getEventsKey(gid), 0, MAX_EVENTS);
    const events = serializedEvents.map(JSON.parse);
    return events;
  }

  async addEvent(gid, event) {
    const serializedEvent = JSON.stringify(event);
    await client.rpushAsync(getEventsKey(gid), serializedEvent);
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
    gameModel.addEvent(gid, event);
    // 2. emit to all live clients

    if (this.gameToSocket.get(gid)) {
      this.gameToSocket.get(gid).forEach(async (socket) => {
        socket.emit('game_event', event);
      });
    }
  }

  listen() {
    io.on('connection', (socket) => {
      console.log('[connect]', socket.id);
      socket.on('join', async (gid, ack) => {
        console.log('[join]', gid);
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
          console.log('emit game event');
          console.log('[message]', message);
          this.addEvent(message.gid, message.event);
          cbk();
        });
        ack();
      });

      // Perform the "initial sync"
      socket.on('sync_all', async (gid, cbk) => {
        console.log('[sync_all]', gid);
        const events = await gameModel.getEvents(gid);
        cbk(events);
      });

      socket.on('disconnect', () => {
        console.log('[disconnect]', socket.id);
        if (!this.socketToGame.has(socket)) {
          return;
        }
        const gid = this.socketToGame.get(socket);
        _.remove(this.gameToSocket.get(gid), socket);
        this.socketToGame.delete(socket);
      });
    });
  }
}

// ============== End Socket Manager ==============

// ================== Begin Stats ====================

function getStatsForTimeWindow(socketManager, seconds) {
  const stats = {
    windowStart: Date.now(),
    counts: {
      gameEvents: 0,
      activeGames: 0,
    },
    activeGids: [],
  };
  const activeGames = new Set();
  socketManager.on('event', (gid, event) => {
    stats.counts.gameEvents++;
    if (!activeGames.has(gid)) {
      activeGames.add(gid);
      stats.counts.activeGames++;
      stats.activeGids.push(gid);
    }
  });

  setInterval(() => {
    for (const key in stats.counts) {
      stats.counts[key] = 0;
    }
    activeGames.clear();
    stats.activeGids = [];
    stats.windowStart = Date.now();
  }, seconds * 1000);
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
    secs: 60 * 24,
  },
  {
    name: 'week',
    secs: 60 * 24 * 7,
  },
  {
    name: 'month',
    secs: 60 * 24 * 31,
  },
];
// ================== End Stats ================

const gameModel = new GameModel();
const socketManager = new SocketManager();
socketManager.listen();

const stats = _.fromPairs(
  STAT_DEFS.map(({name, secs}) => [name, getStatsForTimeWindow(socketManager, secs)])
);
app.get('/test', (req, res) => res.send('Hello World!'));
app.get('/api/stats', (req, res) => {
  res.status(200).json(stats);
});
server.listen(port, () => console.log(`Listening on port ${port}`));
