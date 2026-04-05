import Chat from '../../db/models/Chats.model.js';
import Message from '../../db/models/Messages.model.js';
import { logger } from '../../logger.js';

class MessageService {
  static async createMessage(chatId, userId, content, sender = 'user') {
    const chat = await Chat.findOne({ _id: chatId, user: userId });
    if (!chat) throw new Error('Chat not found or access denied');

    const message = await Message.create({
      chatId,
      sender,
      content: content.trim(),
      timestamp: new Date(),
    });

    await Chat.findByIdAndUpdate(chatId, {
      $push: { messages: message._id },
    });

    return message;
  }

  static async sendUserMessage(chatId, userId, content) {
    return this.createMessage(chatId, userId, content, 'user');
  }

  static async sendBotMessage(chatId, userId) {
    try {
      const response = await fetch('https://meowfacts.herokuapp.com/');
      const catFacts = await response.json();
      const botContent = `🤖 ${catFacts.data[0]}`;
      return this.createMessage(chatId, userId, botContent, 'bot');
    } catch (err) {
      logger.error({ error: err.message }, 'Failed to fetch bot message');
      return this.createMessage(chatId, userId, '🤖 Meow! (Something went wrong)', 'bot');
    }
  }

  static async getMessagesByChat(chatId, userId) {
    const chat = await Chat.findOne({ _id: chatId, user: userId }).populate({
      path: 'messages',
      options: { sort: { createdAt: 1 } },
    });

    if (!chat) throw new Error('Chat not found or access denied');
    return chat.messages;
  }
}

export default MessageService;
