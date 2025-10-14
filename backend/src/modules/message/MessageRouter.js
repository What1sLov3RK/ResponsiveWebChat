import { Router } from 'express';
import authenticateToken from '../../middleware/authenticateToken.js';
import MessageController from './MessageController.js';

const MessageRouter = Router();

MessageRouter.get('/:chatId', authenticateToken, MessageController.getMessagesByChat);

MessageRouter.post('/send', authenticateToken, MessageController.sendUserMessage);

export default MessageRouter;
