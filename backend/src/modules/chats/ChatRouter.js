import { Router } from 'express';
import ChatController from './ChatController.js';
import authMiddleware from '../../middleware/authenticateToken.js';

const ChatRouter = Router();

ChatRouter.get('/all-chats', authMiddleware, ChatController.getAllChats);
ChatRouter.post('/create', authMiddleware, ChatController.createChat);
ChatRouter.patch('/', authMiddleware, ChatController.renameChat);
ChatRouter.delete('/:id', authMiddleware, ChatController.deleteChat);

export default ChatRouter;
