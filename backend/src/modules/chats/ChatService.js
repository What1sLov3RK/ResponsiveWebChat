import Chat from '../../db/models/Chats.model.js';
import Message from '../../db/models/Messages.model.js';
import { logger } from '../../logger.js';

class ChatService {
  static async getAllChats(userId) {
    try {
      if (!userId) {
        throw new Error('Missing userId in ChatService.getAllChats');
      }

      const chats = await Chat.find({ user: userId })
        .populate({
          path: 'messages',
          options: { sort: { createdAt: 1 } },
        })
        .lean()
        .exec();

      return chats;
    } catch (err) {
      logger.error('❌ getAllChats failed:', err.message);
      throw new Error('Database query failed in getAllChats');
    }
  }

  static async createChat(userId, firstname, lastname) {
    const name = `${firstname} ${lastname}`.trim() || 'New Chat';
    const chat = await Chat.create({ name, user: userId, messages: [] });
    return chat;
  }

  static async renameChat(chatId, newChatName) {
    return Chat.findByIdAndUpdate(chatId, { name: newChatName }, { new: true });
  }

  static async deleteChat(chatId) {
    await Chat.findByIdAndDelete(chatId);
  }
}

export default ChatService;
