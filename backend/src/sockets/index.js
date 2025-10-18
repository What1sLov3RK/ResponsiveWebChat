import { Server } from 'socket.io';
import { SOCKET_EVENTS } from './socket.events.js';
import { logSocketEvent } from './socketLogger.js';
import { config } from '../config/index.js';
import { logger } from '../logger.js';
import { socketAuth } from '../middleware/socketAuth.js';
import registerMessageHandlers from './handlers/message.handler.js';

export const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: config.corsOrigin || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.use(socketAuth);
  registerMessageHandlers(io);

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
    logger.error({ error: err }, 'Socket engine error');
  });

  logSocketEvent({ id: 'server' }, 'socket_server_initialized');

  return io;
};
