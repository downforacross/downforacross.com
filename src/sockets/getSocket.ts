import io from 'socket.io-client';
import {SOCKET_HOST} from '../api/constants';

// @ts-ignore
import Promise from 'bluebird';
// yuck
Promise.promisifyAll(io);

let websocketPromise: Promise<SocketIOClient.Socket>;
export const getSocket = () => {
  if (!websocketPromise) {
    websocketPromise = (async () => {
      console.log('in promise');
      // Note: In attempt to increase websocket limit, use upgrade false
      // https://stackoverflow.com/questions/15872788/maximum-concurrent-socket-io-connections
      const socket = io(SOCKET_HOST, {upgrade: false, transports: ['websocket']});
      (window as any).socket = socket;

      socket.on('pong', (ms: number) => {
        (window as any).connectionStatus = {
          latency: ms,
          timestamp: Date.now(),
        };
      });

      // debug stuff
      socket.on('connect', (event: any) => {
        console.debug('[ws connect]', event);
      });
      socket.on('connect', (event: any) => {
        console.debug('[ws connect]', event);
      });
      socket.on('ping', () => {
        console.debug('[ws ping]', Date.now());
      });
      socket.on('pong', () => {
        console.debug('[ws pong]', Date.now());
      });

      console.log('Connecting to', SOCKET_HOST);
      await (socket as any).onceAsync('connect');

      return socket;
    })();
  }
  return websocketPromise;
};
