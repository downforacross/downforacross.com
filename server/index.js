const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const server = require('http').Server(app);
const io = require('socket.io')(server);
const _ = require('lodash');
// ============== Socket Manager ==============

// Todo socket.js, make it a class SocketManager
const gameToSocket = new Map();
const socketToGame = new Map(); // Redundancy for sake of correctness

// Precondition: gid's game is "hot"
const addEvent = (gid, event) => {
  // 1. save to DB

  // 2. emit to all live clients
  gameToSocket.get(gid).forEach((socket) => {
    socket.emit('game_event', event);
  });

  // 3. don't forget to do the SERVER_TIME thing
  // MVP: start w/ getting step 2 working
};

io.on('connection', (socket) => {
  socket.on('join', (gid) => {
    if (socketToGame.has(socket)) {
      throw new Error(`Socket ${socket.id} already joined ${socketToGame.get(socket)}, cannot join ${gid}`);
    }
    console.log(`socket ${socket.id} joining ${gid}`);

    if (!gameToSocket.get(gid)) {
      gameToSocket.set(gid, []);
    }
    gameToSocket.get(gid).push(socket);
    socketToGame.set(socket, gid);
  });

  // TODO catch up the socket on the game's current state

  socket.on('message', (message) => {
    addEvent(message.gid, message.event);
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
