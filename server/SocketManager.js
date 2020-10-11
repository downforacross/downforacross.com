const _ = require('lodash');

// ============= Server Values ===========

// Look for { .sv: 'timestamp' } and relpcae with Date.now()
function assignTimestamp(event) {
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
}

// ============== Socket Manager ==============

class SocketManager {
  constructor(gameModel, io) {
    this.gameModel = gameModel;
    this.io = io;
  }

  async addEvent(gid, event) {
    event = assignTimestamp(event);

    await this.gameModel.addEvent(gid, event);
    this.io.to(`game-${gid}`).emit('game_event', event);
  }

  getLiveSocketsCount() {
    return _.keys(this.io.sockets.sockets).length;
  }

  listen() {
    this.io.on('connection', (socket) => {
      socket.on('join', async (gid, ack) => {
        socket.join(`game-${gid}`);
        ack();
      });

      socket.on('sync_all', async (gid, ack) => {
        const events = await this.gameModel.getEvents(gid);
        ack(events);
      });

      socket.on('game_event', async (message, ack) => {
        await this.addEvent(message.gid, message.event);
        ack();
      });
    });
  }
}
exports.SocketManager = SocketManager;
