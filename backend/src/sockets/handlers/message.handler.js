import { SOCKET_EVENTS } from '../socket.events.js';
import { logSocketEvent } from '../socketLogger.js';
import MessageService from '../../modules/message/MessageService.js';
import Chat from '../../db/models/Chats.model.js';
import { logger } from '../../logger.js';

/**
 * Handles message-related socket events.
 * Assumes socket.user is already attached by socketAuth middleware.
 */
export default function registerMessageHandlers(io) {
  io.on(SOCKET_EVENTS.CONNECTION, (socket) => {
    logSocketEvent(socket, 'connection', { user: socket.user });

    socket.on(SOCKET_EVENTS.JOIN_CHAT, async (chatId) => {
      try {
        if (!chatId) return;
        socket.join(chatId);
        logSocketEvent(socket, 'join_chat', { chatId });
      } catch (err) {
        logSocketEvent(socket, 'join_chat_error', { error: err.message }, 'error');
      }
    });

    socket.on(SOCKET_EVENTS.SEND_MESSAGE, async ({ chatId, content }) => {
      try {
        if (!chatId || !content?.trim()) return;
        const userId = socket.user.userId;

        logSocketEvent(socket, 'send_message', { chatId, content });

        const userMessage = await MessageService.sendUserMessage(chatId, userId, content);

        io.to(chatId).emit(SOCKET_EVENTS.RECEIVE_MESSAGE, {
          ...userMessage.toObject(),
          chatId,
        });

        // Check if it's a bot chat to trigger bot response
        const chat = await Chat.findById(chatId);
        if (chat && chat.isBot) {
          const botMessage = await MessageService.sendBotMessage(chatId, userId);
          io.to(chatId).emit(SOCKET_EVENTS.RECEIVE_MESSAGE, {
            ...botMessage.toObject(),
            chatId,
          });
          logSocketEvent(socket, 'bot_reply', { chatId, botContent: botMessage.content });
        }
      } catch (err) {
        logSocketEvent(socket, 'send_message_error', { error: err.message }, 'error');
        socket.emit(SOCKET_EVENTS.ERROR_MESSAGE, err.message || 'Failed to send message');
      }
    });

    socket.on(SOCKET_EVENTS.TYPING_START, async (chatId) => {
      try {
        if (!chatId) return;
        const chat = await Chat.findById(chatId);
        if (!chat) return;

        chat.participants.forEach((participantId) => {
          if (String(participantId) !== String(socket.user.userId)) {
            io.to(`user:${participantId}`).emit(SOCKET_EVENTS.TYPING_START, {
              chatId,
              userId: socket.user.userId,
            });
          }
        });
      } catch (err) {
        logger.error({ error: err.message }, 'Typing start error');
      }
    });

    socket.on(SOCKET_EVENTS.TYPING_STOP, async (chatId) => {
      try {
        if (!chatId) return;
        const chat = await Chat.findById(chatId);
        if (!chat) return;

        chat.participants.forEach((participantId) => {
          if (String(participantId) !== String(socket.user.userId)) {
            io.to(`user:${participantId}`).emit(SOCKET_EVENTS.TYPING_STOP, {
              chatId,
              userId: socket.user.userId,
            });
          }
        });
      } catch (err) {
        logger.error({ error: err.message }, 'Typing stop error');
      }
    });

    socket.on(SOCKET_EVENTS.DISCONNECT, (reason) => {
      logSocketEvent(socket, 'disconnect', { reason });
    });
  });
}
