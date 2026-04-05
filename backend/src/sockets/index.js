import { Server } from 'socket.io';
import { SOCKET_EVENTS } from './socket.events.js';
import { logSocketEvent } from './socketLogger.js';
import { config } from '../config/index.js';
import { logger } from '../logger.js';
import { socketAuth } from '../middleware/socketAuth.js';
import registerMessageHandlers from './handlers/message.handler.js';

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
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
    const userId = socket.user?.userId;

    if (userId) {
      socket.join(`user:${userId}`);
      logger.info({ userId, socketId: socket.id }, 'User joined private room');

      // Send initial list of online users
      const onlineUserIds = Array.from(io.sockets.sockets.values())
        .map(s => s.user?.userId)
        .filter(id => id && id !== userId);
      
      socket.emit(SOCKET_EVENTS.USER_ONLINE, { userIds: [...new Set(onlineUserIds)] });

      // Notify others that user is online (only if it's the first connection)
      const hasOtherConnections = Array.from(io.sockets.sockets.values())
        .some(s => s.user?.userId === userId && s.id !== socket.id);

      if (!hasOtherConnections) {
        socket.broadcast.emit(SOCKET_EVENTS.USER_ONLINE, { userId });
      }
    }

    socket.on('join', (room) => {
      socket.join(room);
      logSocketEvent(socket, 'join_room', { room });
    });

    socket.on(SOCKET_EVENTS.DISCONNECT, (reason) => {
      logSocketEvent(socket, 'disconnect', { reason });
      if (userId) {
        // Check if user has other active connections
        const hasOtherConnections = Array.from(io.sockets.sockets.values())
          .some(s => s.user?.userId === userId && s.id !== socket.id);
        
        if (!hasOtherConnections) {
          socket.broadcast.emit(SOCKET_EVENTS.USER_OFFLINE, { userId });
        }
      }
    });
  });

  io.engine.on('connection_error', (err) => {
    logger.error({ error: err }, 'Socket engine error');
  });

  logSocketEvent({ id: 'server' }, 'socket_server_initialized');

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};
