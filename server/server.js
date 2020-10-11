const express = require('express');
const app = express();
const morgan = require('morgan');

const port = process.env.PORT || 3000;

const server = require('http').Server(app);
const io = require('socket.io')(server, {pingInterval: 2000, pingTimeout: 5000});
const _ = require('lodash');
const cors = require('cors');
const {GameModel} = require('./GameModel');
const {connectPG} = require('./connectPG');
const {SocketManager} = require('./SocketManager');

// ======== HTTP Server Config ==========

io.origins('*:*'); // allow CORS for socket.io route
app.use(cors()); // allow CORS for all express routes
app.use(morgan('combined'));

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
  const pgClient = connectPG();
  const gameModel = new GameModel(pgClient);
  const socketManager = new SocketManager(gameModel, io);
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
