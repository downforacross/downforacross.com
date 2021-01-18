// ============= Server Values ===========

import _ from 'lodash';
import socketIo from 'socket.io';
import {addGameEvent, GameEvent, getGameEvents} from './model/game';

interface SocketEvent {
  [key: string]: any;
}

// Look for { .sv: 'timestamp' } and relpcae with Date.now()
function assignTimestamp(event: SocketEvent) {
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
  io: socketIo.Server;
  constructor(io: socketIo.Server) {
    this.io = io;
  }

  async addGameEvent(gid: string, event: SocketEvent) {
    const gameEvent: GameEvent = assignTimestamp(event);
    await addGameEvent(gid, gameEvent);
    this.io.to(`game-${gid}`).emit('game_event', gameEvent);
  }
  async addRoomEvent(gid: string, event: SocketEvent) {
    const gameEvent: GameEvent = assignTimestamp(event);
    await addGameEvent(gid, gameEvent);
    this.io.to(`game-${gid}`).emit('game_event', gameEvent);
  }

  listen() {
    this.io.on('connection', (socket) => {
      socket.on('join', async (gid, ack) => {
        socket.join(`game-${gid}`);
        ack();
      });

      socket.on('sync_all', async (gid, ack) => {
        const events = await getGameEvents(gid);
        ack(events);
      });
      socket.on('sync_all_room_events', async (gid, ack) => {
        const events = await getGameEvents(gid);
        ack(events);
      });

      socket.on('game_event', async (message, ack) => {
        await this.addGameEvent(message.gid, message.event);
        ack();
      });

      // socket.on('room_event', async (message, ack) => {
      //   await this.addRoomEvent(message.gid, message.event);
      //   ack();
      // });
    });
  }
}

export default SocketManager;
