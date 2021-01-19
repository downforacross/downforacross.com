export const emitAsync = (socket: SocketIOClient.Socket, ...args: any[]) =>
  new Promise((resolve) => {
    (socket as any).emit(...args, resolve);
  });
