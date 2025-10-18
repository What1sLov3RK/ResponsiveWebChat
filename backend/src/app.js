import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import swaggerUi from 'swagger-ui-express';

import { config } from './config/index.js';
import { logger } from './logger.js';
import UserRouter from './modules/users/UserRouter.js';
import ChatRouter from './modules/chats/ChatRouter.js';
import MessageRouter from './modules/message/MessageRouter.js';
import swaggerFile from './docs/swagger-output.json' assert { type: 'json' };

const app = express();

app.use(
  pinoHttp({
    logger,
    customLogLevel: function (res, err) {
      if (res.statusCode >= 500 || err) return 'error';
      if (res.statusCode >= 400) return 'warn';
      return 'info';
    },
  }),
);

app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));

app.use('/api/users', UserRouter);
app.use('/api/chat', ChatRouter);
app.use('/api/message', MessageRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  logger.error({ error: err.message, stack: err.stack }, 'Unhandled error');
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

export default app;
