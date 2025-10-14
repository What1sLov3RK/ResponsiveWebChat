import MessageService from './MessageService.js';
import Chat from '../../db/models/Chats.model.js';
import { logger } from '../../logger.js';

class MessageController {
  static async sendUserMessage(req, res) {
    try {
      const { chatId, content } = req.body;
      const message = await MessageService.sendUserMessage(chatId, content);
      res.json(message);
    } catch (err) {
      logger.error({ error: err }, 'Message send failed');
      res.status(400).json({ error: err.message });
    }
  }

  static async sendBotMessage(req, res) {
    try {
      const { chatId } = req.body;
      const message = await MessageService.sendBotMessage(chatId);
      res.json(message);
    } catch (err) {
      logger.error(err);
      res.status(400).json({ error: err.message });
    }
  }

  static async getMessagesByChat(req, res) {
    try {
      const { chatId } = req.params;
      const chat = await Chat.findById(chatId)
        .populate({
          path: 'messages',
          options: { sort: { timestamp: 1 } },
        })
        .lean();

      if (!chat) return res.status(404).json({ error: 'Chat not found' });
      res.json({ messages: chat.messages });
    } catch (err) {
      logger.error({ error: err }, 'Failed to load messages');
      res.status(500).json({ error: 'Failed to load messages' });
    }
  }
}

export default MessageController;
