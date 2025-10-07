import UsersCommands from "../db/users/UsersCommands.js";
import Chat from '../db/models/Chats.model.js';
import Message from '../db/models/Messages.model.js';

class ChatService {
    static async createChat(userId, firstname, lastname) {
        const user = await UsersCommands.findOneById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        const chatName = `${firstname} ${lastname}`;
        const chat = await Chat.create({ name: chatName, user: userId });
        user.chats.push(chat._id);
        await user.save();
        return chat;
    }

    static async sendUserMessage(chatId, content) {
        const chat = await Chat.findById(chatId);
        if (!chat) {
            throw new Error('Chat not found');
        }
        const message = await Message.create({ content, chatId, sender: 'user' });
        chat.messages.push(message._id);
        await chat.save();

        return message;
    }

    static async sendBotMessage(chatId) {
        const chat = await Chat.findById(chatId);
        const response = await fetch("https://dummyjson.com/quotes/random", { method: "GET" });
        const data = await response.json();
        const randomQuote = data.quote;
        const replyMessage = await Message.create({ content: randomQuote, chatId, sender: 'bot' });
        chat.messages.push(replyMessage._id);
        await chat.save();

        return replyMessage;
    }

    static async getAllChats(userId) {
        const chats = await Chat.find({ user: userId }).populate({
            path: 'messages',
            options: { sort: { createdAt: 1 } }
        }).exec();

        return chats;
    }

    static async deleteChat(chatId) {
        const result = await Chat.deleteOne({ _id: chatId }).exec();
        if (result.deletedCount === 0) {
            throw new Error('Chat not found');
        }
    }

    static async updateChatName(userId, chatId, newChatName) {
        const chat = await Chat.findById(chatId).exec();
        if (!chat) {
            throw new Error('Chat not found');
        }

        if (chat.user.toString() !== userId) {
            throw new Error('You do not have permission to update this chat');
        }

        chat.name = newChatName;
        await chat.save();

        return chat;
    }
}

export default ChatService;
