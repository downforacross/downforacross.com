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
    console.log('[GameModel] getting events', gid);
    const serializedEvents = await client.lrangeAsync(getEventsKey(gid), 0, MAX_EVENTS);
    const events = serializedEvents.map(JSON.parse);
    console.log('[GameModel] got events', events); // TODO possibly truncate this log message
    return events;
  }

  async addEvent(gid, event) {
    console.log('[GameModel] adding event', gid, event);
    const serializedEvent = JSON.stringify(event);
    await client.rpushAsync(getEventsKey(gid), serializedEvent);
    console.log('[GameModel] added event');
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

// Performs the "initial sync"
const sendAllEvents = async (gid, socket) => {
  // TODO implement
  const events = await gameModel.getEvents(gid);
  console.log(`Sending ${events.length} events to ${socket.id}`);
  // TODO new type of message, e.g. initial_sync_game_events ?
};

io.on('connection', (socket) => {
  socket.on('join', async (gid) => {
    if (socketToGame.has(socket)) {
      throw new Error(`Socket ${socket.id} already joined ${socketToGame.get(socket)}, cannot join ${gid}`);
    }
    console.log(`socket ${socket.id} joining ${gid}`);

    await sendAllEvents(gid, socket);
    console.log(`socket ${socket.id} done with initial sync`);
    if (!gameToSocket.get(gid)) {
      gameToSocket.set(gid, []);
    }
    gameToSocket.get(gid).push(socket);
    socketToGame.set(socket, gid);

    socket.on('message', (message) => {
      addEvent(message.gid, message.event);
    });
  });

  socket.on('disconnect', () => {
    if (!socketToGame.has(socket)) {
      return;
    }
    const gid = socketToGame.get(socket);
    console.log(`socket ${socket.id} leaving ${gid}`);
    _.remove(gameToSocket.get(gid), socket);
    socketToGame.delete(socket);
  });
});

// ============== End Socket Manager ==============

app.get('/test', (req, res) => res.send('Hello World!'));

server.listen(port, () => console.log(`Listening on port ${port}`));
