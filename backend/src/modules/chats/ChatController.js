import ChatService from './ChatService.js';
import { logger } from '../../logger.js';

class ChatController {
  static async getAllChats(req, res) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized: missing userId' });
      }

      const chats = await ChatService.getAllChats(userId);
      return res.status(200).json({ chats });
    } catch (err) {
      logger.error({ error: err.message }, 'GetAllChats error');
      return res.status(500).json({ error: 'Failed to fetch chats' });
    }
  }

  static async createChat(req, res) {
    try {
      const { firstname, lastname } = req.body;
      const userId = req.user?.userId;
      const newChat = await ChatService.createChat(userId, firstname, lastname);
      logger.info({ chatId: newChat.id }, 'Chat created');
      res.status(201).json({ chat: newChat });
    } catch (error) {
      logger.error({ error: error }, 'Chat create failed ');
      res.status(500).json({ error: 'Failed to create chat' });
    }
  }

  static async renameChat(req, res) {
    try {
      const { chatId, newChatName } = req.body;
      const chat = await ChatService.renameChat(chatId, newChatName);
      logger.info({ chatId: chatId }, 'Chat renamed');
      res.status(200).json({ chat });
    } catch (error) {
      logger.error({ error: error }, 'Chat rename failed');
      res.status(500).json({ error: 'Failed to rename chat' });
    }
  }

  static async deleteChat(req, res) {
    try {
      const { id } = req.params;
      await ChatService.deleteChat(id);
      logger.info({ chatId: id }, 'Chat deleted');
      res.status(200).json({ message: 'Chat deleted successfully' });
    } catch (error) {
      logger.error({ error: error }, 'Chat delete failed');
      res.status(500).json({ error: 'Failed to delete chat' });
    }
  }
}

export default ChatController;
