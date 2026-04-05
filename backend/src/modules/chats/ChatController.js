import ChatService from './ChatService.js';
import { logger } from '../../logger.js';

class ChatController {
  static async getAllChats(req, res) {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: missing userId' });
    }
    const chats = await ChatService.getAllChats(userId);
    return res.status(200).json({ chats });
  }

  static async createChat(req, res) {
    const { firstname, lastname } = req.body;
    const userId = req.user?.userId;
    const newChat = await ChatService.createChat(userId, firstname, lastname);
    logger.info({ chatId: newChat._id }, 'Chat created');
    res.status(201).json({ chat: newChat });
  }

  static async renameChat(req, res) {
    const { chatId, newChatName } = req.body;
    const userId = req.user?.userId;
    if (!chatId || !newChatName) {
      return res.status(400).json({ error: 'chatId and newChatName are required' });
    }
    const chat = await ChatService.renameChat(chatId, userId, newChatName);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found or access denied' });
    }
    logger.info({ chatId: chatId }, 'Chat renamed');
    res.status(200).json({ chat });
  }

  static async deleteChat(req, res) {
    const { id } = req.params;
    const userId = req.user?.userId;
    await ChatService.deleteChat(id, userId);
    logger.info({ chatId: id }, 'Chat deleted');
    res.status(200).json({ message: 'Chat deleted successfully' });
  }
}

export default ChatController;
