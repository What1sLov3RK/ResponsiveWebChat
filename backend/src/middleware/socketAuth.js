import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import { config } from '../config/index.js';
import { logger } from '../logger.js';

/**
 * Socket.IO middleware for JWT cookie authentication.
 * It verifies `access_token` from handshake cookies and attaches user info to socket.
 */
export const socketAuth = (socket, next) => {
  try {
    const cookieHeader = socket.handshake.headers?.cookie || '';
    if (!cookieHeader) {
      logger.warn('⚠️ No cookie header in socket handshake');
      return next(new Error('Unauthorized'));
    }

    const cookies = cookie.parse(cookieHeader);
    const token = cookies.access_token;
    if (!token) {
      logger.warn('⚠️ Missing access_token cookie');
      return next(new Error('Unauthorized'));
    }

    const decoded = jwt.verify(token, config.jwtAccessSecret);

    socket.user = { userId: decoded.userId, email: decoded.email };
    logger.info({ socketId: socket.id, email: decoded.email }, '✅ Socket authorized successfully');
    logger.info({ cookies: cookieHeader }, '🍪 Incoming cookies');

    return next();
  } catch (err) {
    logger.error({ socketId: socket.id, error: err.message }, '❌ Socket authorization failed');
    return next(new Error('Unauthorized'));
  }
};
