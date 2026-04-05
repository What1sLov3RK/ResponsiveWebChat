import ChatService from './ChatService.js';
import { logger } from '../../logger.js';
import { getIO } from '../../sockets/index.js';
import { SOCKET_EVENTS } from '../../sockets/socket.events.js';

class ChatController {
  static async getAllChats(req, res) {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: missing userId' });
    }
    const chats = await ChatService.getAllChats(userId);
    return res.status(200).json({ chats });
  }

  static async createChat(req, res) {
    const { firstname, lastname, email, isBot } = req.body;
    const userId = req.user?.userId;

    let newChat;
    if (email) {
      newChat = await ChatService.createUserChat(userId, email);
    } else {
      // Default to bot if not specified, or if it's explicitly a bot chat
      const shouldBeBot = isBot !== undefined ? isBot : true;
      newChat = await ChatService.createChat(userId, firstname, lastname, shouldBeBot);
    }

    logger.info({ chatId: newChat._id }, 'Chat created');

    // Notify all participants via WebSockets
    try {
      const io = getIO();
      // Fetch fully populated chat for notification
      const populatedChat = await ChatService.getChatById(newChat._id);
      
      newChat.participants.forEach(participantId => {
        io.to(`user:${participantId}`).emit(SOCKET_EVENTS.CHAT_CREATED, { chat: populatedChat });
      });
    } catch (err) {
      logger.error({ error: err.message }, 'Failed to notify participants of new chat');
    }

    res.status(201).json({ chat: newChat });
  }

  static async renameChat(req, res) {
    const { chatId, newChatName } = req.body;
    const userId = req.user?.userId;
    if (!chatId || !newChatName) {
      return res.status(400).json({ error: 'chatId and newChatName are required' });
    }
    const chat = await ChatService.renameChat(chatId, userId, newChatName);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found or access denied' });
    }
    logger.info({ chatId: chatId }, 'Chat renamed');
    res.status(200).json({ chat });
  }

  static async deleteChat(req, res) {
    const { id } = req.params;
    const userId = req.user?.userId;
    const deletedChat = await ChatService.deleteChat(id, userId);

    if (deletedChat) {
      logger.info({ chatId: id }, 'Chat deleted');
      try {
        const io = getIO();
        deletedChat.participants.forEach(participantId => {
          io.to(`user:${participantId}`).emit(SOCKET_EVENTS.CHAT_DELETED, { chatId: id });
        });
      } catch (err) {
        logger.error({ error: err.message }, 'Failed to notify participants of chat deletion');
      }
    }

    res.status(200).json({ message: 'Chat deleted successfully' });
  }
}

export default ChatController;
