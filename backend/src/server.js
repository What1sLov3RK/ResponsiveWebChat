import { createServer } from 'http';
import app from './app.js';
import mongoose from 'mongoose';
import { initSocket } from './sockets/index.js';
import { logger } from './logger.js';

const httpServer = createServer(app);

initSocket(httpServer);

const PORT = 4000;

(async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    logger.info('✅ Connected to MongoDB');

    httpServer.listen(PORT, () => {
      logger.info('🚀 Server running on port ' + PORT);
    });
  } catch (err) {
    logger.error('❌ Failed to start server: ' + err);
  }
})();
