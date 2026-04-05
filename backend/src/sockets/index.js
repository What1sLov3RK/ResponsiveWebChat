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
      origin: (origin, callback) => {
        const allowedOrigins = [config.corsOrigin, 'http://localhost:3000', 'http://127.0.0.1:3000'];
        if (!origin || config.node_env !== 'production' || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Origin not allowed by CORS'));
        }
      },
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
