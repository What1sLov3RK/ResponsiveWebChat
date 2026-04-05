import { Router } from 'express';
import ChatController from './ChatController.js';
import authMiddleware from '../../middleware/authenticateToken.js';
import asyncHandler from '../../utils/asyncHandler.js';

const ChatRouter = Router();

ChatRouter.get('/all-chats', authMiddleware, asyncHandler(ChatController.getAllChats));
ChatRouter.post('/create', authMiddleware, asyncHandler(ChatController.createChat));
ChatRouter.patch('/', authMiddleware, asyncHandler(ChatController.renameChat));
ChatRouter.delete('/:id', authMiddleware, asyncHandler(ChatController.deleteChat));

export default ChatRouter;
