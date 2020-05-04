const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const server = require('http').Server(app);
const io = require('socket.io')(server);
const _ = require('lodash');

const Promise = require('bluebird');
const redis = require('redis');
Promise.promisifyAll(redis);
const client = redis.createClient();
// ============= Database Operations ============

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

// Precondition: gid's game is "hot"
const addEvent = (gid, event) => {
  // 1. save to DB
  gameModel.addEvent(gid, event);
  // 2. emit to all live clients
  if (gameToSocket.get(gid)) {
    gameToSocket.get(gid).forEach((socket) => {
      socket.emit('game_event', event);
    });
  }

  // 3. don't forget to do the SERVER_TIME thing
  // MVP: start w/ getting step 2 working
};

io.on('connection', (socket) => {
  socket.on('join', async (gid, ack) => {
    if (socketToGame.has(socket)) {
      throw new Error(`Socket ${socket.id} already joined ${socketToGame.get(socket)}, cannot join ${gid}`);
    }

    if (!gameToSocket.get(gid)) {
      gameToSocket.set(gid, []);
    }
    gameToSocket.get(gid).push(socket);
    socketToGame.set(socket, gid);

    socket.on('message', (message) => {
      addEvent(message.gid, message.event);
    });
    ack();
  });

  // Perform the "initial sync"
  socket.on('sync_all', async (gid, cbk) => {
    const events = await gameModel.getEvents(gid);
    cbk(events);
  });

  socket.on('disconnect', () => {
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
