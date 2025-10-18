import { createServer } from 'http';
import mongoose from 'mongoose';
import app from './app.js';
import { initSocket } from './sockets/index.js';
import { logger } from './logger.js';
import { config } from './config/index.js';

const httpServer = createServer(app);
initSocket(httpServer);
logger.info('⚙️ Socket.IO initialized');

(async () => {
  try {
    await mongoose.connect(config.dbUrl, {
      serverSelectionTimeoutMS: 5000,
    });
    logger.info('✅ Connected to MongoDB');
    const PORT = process.env.PORT || 4000;
    httpServer.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
    });

    const shutdown = async (signal) => {
      logger.warn(`${signal} received — closing server...`);
      await mongoose.connection.close();
      httpServer.close(() => {
        logger.info('🧹 Server shut down gracefully');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (err) {
    logger.error({ error: err.message }, '❌ Failed to start server');
    process.exit(1);
  }
})();
