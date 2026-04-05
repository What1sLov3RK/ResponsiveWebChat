import MessageService from './MessageService.js';
import { logger } from '../../logger.js';

class MessageController {
  static async sendUserMessage(req, res) {
    const { chatId, content } = req.body;
    const userId = req.user?.userId;
    if (!chatId || !content) {
      return res.status(400).json({ error: 'chatId and content are required' });
    }
    const message = await MessageService.sendUserMessage(chatId, userId, content);
    res.status(200).json(message);
  }

  static async sendBotMessage(req, res) {
    const { chatId } = req.body;
    const userId = req.user?.userId;
    if (!chatId) {
      return res.status(400).json({ error: 'chatId is required' });
    }
    const message = await MessageService.sendBotMessage(chatId, userId);
    res.status(200).json(message);
  }

  static async getMessagesByChat(req, res) {
    const { chatId } = req.params;
    const userId = req.user?.userId;
    if (!chatId) {
      return res.status(400).json({ error: 'chatId is required' });
    }
    const messages = await MessageService.getMessagesByChat(chatId, userId);
    res.status(200).json({ messages });
  }
}

export default MessageController;
