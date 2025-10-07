import { Router } from 'express';
import ChatController from './ChatController.js';
import authenticateToken from "../middleware/authenticateToken.js";
const ChatRouter = Router();

ChatRouter.post('/create', authenticateToken, ChatController.createChat);
ChatRouter.get('/all-chats', authenticateToken, ChatController.getAllChats)
ChatRouter.post('/send-message', authenticateToken, ChatController.userSendMessage);
ChatRouter.post('/get-reply', authenticateToken, ChatController.newMessageFromBot);
ChatRouter.delete('/:chatId', authenticateToken, ChatController.deleteChat)
ChatRouter.patch('/', authenticateToken, ChatController.patchChatName)

export default ChatRouter;
