const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

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

const gameModel = new GameModel();

// ============== Socket Manager ==============

// Todo socket.js, make it a class SocketManager
const gameToSocket = new Map();
const socketToGame = new Map(); // Redundancy for sake of correctness

const assignTimestamp = (event) => {
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
};

// Precondition: gid's game is "hot"
const addEvent = async (gid, event) => {
  event = assignTimestamp(event);

  // 1. save to DB
  gameModel.addEvent(gid, event);
  // 2. emit to all live clients

  if (gameToSocket.get(gid)) {
    gameToSocket.get(gid).forEach(async (socket) => {
      socket.emit('game_event', event);
    });
  }

  // 3. don't forget to do the SERVER_TIME thing
  // MVP: start w/ getting step 2 working
};

io.on('connection', (socket) => {
  console.log('[connect]', socket.id);
  socket.on('join', async (gid, ack) => {
    console.log('[join]', gid);
    if (socketToGame.has(socket)) {
      throw new Error(`Socket ${socket.id} already joined ${socketToGame.get(socket)}, cannot join ${gid}`);
    }

    if (!gameToSocket.get(gid)) {
      gameToSocket.set(gid, []);
    }
    gameToSocket.get(gid).push(socket);
    socketToGame.set(socket, gid);

    socket.on('game_event', (message, cbk) => {
      console.log('[message]', message);
      addEvent(message.gid, message.event);
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
    if (!socketToGame.has(socket)) {
      return;
    }
    const gid = socketToGame.get(socket);
    _.remove(gameToSocket.get(gid), socket);
    socketToGame.delete(socket);
  });
});

// ============== End Socket Manager ==============

app.get('/test', (req, res) => res.send('Hello World!'));

server.listen(port, () => console.log(`Listening on port ${port}`));
