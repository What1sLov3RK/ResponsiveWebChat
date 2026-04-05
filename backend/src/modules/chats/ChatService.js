import Chat from '../../db/models/Chats.model.js';
import Message from '../../db/models/Messages.model.js';
import { logger } from '../../logger.js';

class ChatService {
  static async getAllChats(userId) {
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
  }

  static async createChat(userId, firstname, lastname) {
    const name = `${firstname} ${lastname}`.trim() || 'New Chat';
    const chat = await Chat.create({ name, user: userId, messages: [] });
    return chat;
  }

  static async renameChat(chatId, userId, newChatName) {
    return Chat.findOneAndUpdate({ _id: chatId, user: userId }, { name: newChatName }, { new: true });
  }

  static async deleteChat(chatId, userId) {
    await Chat.findOneAndDelete({ _id: chatId, user: userId });
  }
}

export default ChatService;
