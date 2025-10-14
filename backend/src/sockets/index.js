import { Server } from 'socket.io';
import { logSocketEvent } from './socketLogger.js';
import { SOCKET_EVENTS } from './socket.events.js';
import messageHandler from './handlers/message.handler.js';

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    pingTimeout: 30000,
    pingInterval: 10000,
  });

  io.on(SOCKET_EVENTS.CONNECTION, (socket) => {
    logSocketEvent(socket, 'connection');

    socket.on('join', (room) => {
      socket.join(room);
      logSocketEvent(socket, 'join_room', { room });
    });

    socket.on(SOCKET_EVENTS.DISCONNECT, (reason) => {
      logSocketEvent(socket, 'disconnect', { reason });
    });
  });

  io.engine.on('connection_error', (err) => {
    console.error('Socket engine error:', err);
  });

  logSocketEvent({ id: 'server' }, 'socket_server_initialized');

  messageHandler(io);

  return io;
};
