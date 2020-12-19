const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
app.use(bodyParser.json());
const port = process.env.PORT || 3000;

const server = require('http').Server(app);
const io = require('socket.io')(server, {pingInterval: 2000, pingTimeout: 5000});
const _ = require('lodash');
const cors = require('cors');
const {GameModel} = require('./GameModel');
const {PuzzleModel} = require('./PuzzleModel');
const {SocketManager} = require('./SocketManager');

// ======== HTTP Server Config ==========

const puzzleModel = new PuzzleModel();

io.origins('*:*'); // allow CORS for socket.io route
app.use(cors()); // allow CORS for all express routes
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('tiny'));
}

app.get('/api/puzzles', async (req, res) => {
  console.log('got req', req.query);
  const page = Number.parseInt(req.query.page);
  const pageSize = Number.parseInt(req.query.pageSize);
  if (!(Number.isFinite(page) && Number.isFinite(pageSize))) {
    return res.status(400).send('page and pageSize should be integers');
  }
  const result = await puzzleModel.listPuzzles({}, pageSize, page * pageSize);
  res.json({
    puzzles: result,
  });
});

app.post('/api/puzzle', async (req, res) => {
  console.log('got req', req.headers, req.body);
  puzzleModel.addPuzzle(req.body.puzzle, req.body.isPublic);
  const pid = 123;
  res.json({
    pid,
  });
});

// ================== Logging ================

function logAllEvents(log) {
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
  const socketManager = new SocketManager(gameModel, io);
  socketManager.listen();
  logAllEvents(console.log);
  server.listen(port, () => console.log(`Listening on port ${port}`));
  process.once('SIGUSR2', () => {
    server.close(() => {
      console.log('exiting...');
      process.kill(process.pid, 'SIGUSR2');
      console.log('exited');
    });
  });
}

runServer();
