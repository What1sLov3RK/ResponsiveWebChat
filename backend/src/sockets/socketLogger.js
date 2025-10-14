import { logger } from '../logger.js';

export const logSocketEvent = (socket, event, data = {}, level = 'info') => {
  logger[level](
    {
      socketId: socket.id,
      event,
      data,
    },
    `Socket event: ${event}`,
  );
};
