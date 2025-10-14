import express from 'express';
import cors from 'cors';

import { config } from './config/index.js';

import pinoHttp from 'pino-http';
import { logger } from './logger.js';

import UserRouter from './modules/users/UserRouter.js';
import ChatRouter from './modules/chats/ChatRouter.js';
import MessageRouter from './modules/message/MessageRouter.js';
import swaggerUi from 'swagger-ui-express';
import swaggerFile from './docs/swagger-output.json' assert { type: 'json' };

const app = express();

app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json());

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));

app.use('/api/users', UserRouter);
app.use('/api/chat', ChatRouter);
app.use('/api/message', MessageRouter);

app.use(pinoHttp(logger));

export default app;
