import Chat from '../../db/models/Chats.model.js';
import Message from '../../db/models/Messages.model.js';

class MessageService {
  static async sendUserMessage(chatId, content) {
    const chat = await Chat.findById(chatId);
    if (!chat) throw new Error('Chat not found');

    const message = await Message.create({ content, chatId, sender: 'user' });
    chat.messages.push(message._id);
    await chat.save();

    return message;
  }

  static async sendBotMessage(chatId) {
    const chat = await Chat.findById(chatId);
    if (!chat) throw new Error('Chat not found');

    const response = await fetch('https://dummyjson.com/quotes/random');
    const data = await response.json();

    const message = await Message.create({
      content: data.quote,
      chatId,
      sender: 'bot',
    });

    chat.messages.push(message._id);
    await chat.save();

    return message;
  }

  static async getMessagesByChat(chatId) {
    const chat = await Chat.findById(chatId).populate({
      path: 'messages',
      options: { sort: { createdAt: 1 } },
    });

    if (!chat) throw new Error('Chat not found');
    return chat.messages;
  }
}

export default MessageService;
