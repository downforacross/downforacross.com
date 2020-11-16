const express = require('express');
const app = express();
const morgan = require('morgan');

const port = process.env.PORT || 3000;

const server = require('http').Server(app);
const io = require('socket.io')(server, {pingInterval: 2000, pingTimeout: 5000});
const _ = require('lodash');
const cors = require('cors');
const {GameModel} = require('./GameModel');
const {PuzzleModel} = require('./PuzzleModel');
const {connectPG} = require('./connectPG');
const {SocketManager} = require('./SocketManager');

// ======== HTTP Server Config ==========

io.origins('*:*'); // allow CORS for socket.io route
app.use(cors()); // allow CORS for all express routes
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
}

app.get('/api/puzzles', async (req, res) => {
  console.log('got req', req.query);
  const page = Number.parseInt(req.query.page);
  const pageSize = Number.parseInt(req.query.pageSize);
  if (!(Number.isFinite(page) && Number.isFinite(pageSize))) {
    return res.status(400).send('page and pageSize should be integers');
  }
  const result = await listPuzzles({}, pageSize, page * pageSize);
  res.json({
    puzzles: result,
  });
});

app.get('/api/puzzle', async (req, res) => {
  console.log('got req', req.query);
  const page = Number.parseInt(req.query.page);
  const pageSize = Number.parseInt(req.query.pageSize);
  if (!(Number.isFinite(page) && Number.isFinite(pageSize))) {
    return res.status(400).send('page and pageSize should be integers');
  }
  const result = await listPuzzles({}, pageSize, page * pageSize);
  res.json({
    puzzles: result,
  });
});

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
  const puzzleModel = new PuzzleModel(pgClient);
  const socketManager = new SocketManager(gameModel, io);
  socketManager.listen();
  logAllEvents(socketManager, console.log);
  await gameModel.connect();
  console.log('connected to database...');
  server.listen(port, () => console.log(`Listening on port ${port}`));
  process.once('SIGUSR2', () => {
    server.close(() => {
      process.kill(process.pid, 'SIGUSR2');
    });
  });
}

runServer();
