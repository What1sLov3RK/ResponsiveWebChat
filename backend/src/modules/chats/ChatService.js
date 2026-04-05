import Chat from '../../db/models/Chats.model.js';
import User from '../../db/models/Users.model.js';
import Message from '../../db/models/Messages.model.js';
import { logger } from '../../logger.js';

class ChatService {
  static async getAllChats(userId) {
    if (!userId) {
      throw new Error('Missing userId in ChatService.getAllChats');
    }

    const chats = await Chat.find({ participants: { $in: [userId] } })
      .populate('participants', 'firstname lastname email')
      .sort({ updatedAt: -1 })
      .lean()
      .exec();

    return chats;
  }

  static async getChatById(chatId) {
    return Chat.findById(chatId)
      .populate('participants', 'firstname lastname email')
      .lean()
      .exec();
  }

  static async createChat(userId, firstname, lastname, isBot = true) {
    const name = `${firstname} ${lastname}`.trim() || (isBot ? 'Bot Chat' : 'New Chat');
    const participants = [userId];
    let avatar = '';
    if (isBot) {
      const botAvatars = [
        'https://randomuser.me/api/portraits/lego/1.jpg',
        'https://randomuser.me/api/portraits/lego/2.jpg',
        'https://randomuser.me/api/portraits/lego/3.jpg',
        'https://randomuser.me/api/portraits/lego/4.jpg',
        'https://randomuser.me/api/portraits/lego/5.jpg',
        'https://randomuser.me/api/portraits/lego/6.jpg',
        'https://randomuser.me/api/portraits/lego/7.jpg',
        'https://randomuser.me/api/portraits/lego/8.jpg',
      ];
      avatar = botAvatars[Math.floor(Math.random() * botAvatars.length)];
    }
    const chat = await Chat.create({ name, participants, isBot, avatar });
    return await chat.populate('participants', 'firstname lastname email');
  }

  static async createUserChat(userId, otherUserEmail) {
    const otherUser = await User.findOne({ email: otherUserEmail });
    if (!otherUser) {
      throw new Error('User with this email not found');
    }
    if (otherUser._id.toString() === userId) {
      throw new Error('You cannot chat with yourself');
    }

    // Check if chat already exists
    let chat = await Chat.findOne({
      participants: { $all: [userId, otherUser._id], $size: 2 },
      isBot: false
    }).populate('participants', 'firstname lastname email');

    if (chat) return chat;

    chat = await Chat.create({
      name: `${otherUser.firstname} ${otherUser.lastname}`,
      participants: [userId, otherUser._id],
      isBot: false
    });

    return await chat.populate('participants', 'firstname lastname email');
  }

  static async renameChat(chatId, userId, newChatName) {
    return Chat.findOneAndUpdate(
      { _id: chatId, participants: { $in: [userId] } },
      { name: newChatName },
      { new: true }
    );
  }

  static async deleteChat(chatId, userId) {
    const deletedChat = await Chat.findOneAndDelete({ _id: chatId, participants: { $in: [userId] } });
    if (deletedChat) {
      await Message.deleteMany({ chatId });
    }
    return deletedChat;
  }
}

export default ChatService;
