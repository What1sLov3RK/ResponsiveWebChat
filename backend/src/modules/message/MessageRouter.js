import { Router } from 'express';
import authenticateToken from '../../middleware/authenticateToken.js';
import MessageController from './MessageController.js';
import asyncHandler from '../../utils/asyncHandler.js';

const MessageRouter = Router();

MessageRouter.get('/:chatId', authenticateToken, asyncHandler(MessageController.getMessagesByChat));

MessageRouter.post('/send', authenticateToken, asyncHandler(MessageController.sendUserMessage));

export default MessageRouter;
