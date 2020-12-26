import express from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';

import http from 'http';
import socketIo from 'socket.io';
import _ from 'lodash';
import cors from 'cors';
import SocketManager from './SocketManager';
import apiRouter from './api/router';

const app = express();
const server = new http.Server(app);
app.use(bodyParser.json());
const port = process.env.PORT || 3000;
const io = socketIo(server, {pingInterval: 2000, pingTimeout: 5000});

// ======== HTTP Server Config ==========

io.origins('*:*'); // allow CORS for socket.io route
app.use(cors()); // allow CORS for all express routes
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('tiny'));
}

app.use('/api', apiRouter);

// ================== Logging ================

function logAllEvents(log: typeof console.log) {
  io.on('*', (event: any, ...args: any) => {
    try {
      log(`[${event}]`, _.truncate(JSON.stringify(args), {length: 100}));
    } catch (e) {
      log(`[${event}]`, args);
    }
  });
}

// ================== Main Entrypoint ================

async function runServer() {
  const socketManager = new SocketManager(io);
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
