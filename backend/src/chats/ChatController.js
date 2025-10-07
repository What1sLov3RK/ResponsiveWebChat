import ChatService from './ChatService.js';
import UserService from "../users/UserService.js";

class ChatController {
    static async refreshToken(req) {
        const { refreshToken } = req.body;
        return await UserService.refreshToken(refreshToken);
  }
    static async createChat(req, res) {
        try {
            const { firstname, lastname } = req.body;
            const userId = req.user.userId;

            const chat = await ChatService.createChat(userId, firstname, lastname);
            res.status(201).json({ chat });
        } catch (error) {
            console.error('Failed to create chat:', error.message);
            res.status(500).json({ error: error.message });
        }
    }

    static async userSendMessage(req, res) {
        try {
            const { chatId, content } = req.body;

            const message = await ChatService.sendUserMessage(chatId, content);
            res.status(201).json({ message });
        } catch (error) {
            console.error('Failed to send message:', error.message);
            res.status(500).json({ error: error.message });
        }
    }

    static async newMessageFromBot(req, res) {
        try {
            const { chatId } = req.body;

            const replyMessage = await ChatService.sendBotMessage(chatId);
            res.status(201).json({ message: replyMessage });
        } catch (error) {
            console.error('Failed to send bot message:', error.message);
            res.status(500).json({ error: error.message });
        }
    }

    static async getAllChats(req, res) {
        try {
            const userId = req.user.userId;

            const chats = await ChatService.getAllChats(userId);
            res.status(200).json({ chats });
        } catch (error) {
            console.error('Failed to retrieve chats:', error.message);
            res.status(500).json({ error: error.message });
        }
    }

    static async deleteChat(req, res) {
        try {
            const { chatId } = req.params;

            await ChatService.deleteChat(chatId);
            res.status(200).json({ message: "Chat deleted" });
        } catch (error) {
            console.error('Failed to delete chat:', error.message);
            res.status(500).json({ error: error.message });
        }
    }

    static async patchChatName(req, res) {
        try {
            const userId = req.user.userId;
            const { chatId, newChatName } = req.body;

            await ChatService.updateChatName(userId, chatId, newChatName);
            res.status(200).json({ message: 'Chat name updated successfully!' });
        } catch (error) {
            console.error('Failed to update chat name:', error.message);
            res.status(500).json({ error: error.message });
        }
    }
}

export default ChatController;
