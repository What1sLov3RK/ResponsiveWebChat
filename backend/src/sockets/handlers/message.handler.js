import Chat from '../../db/models/Chats.model.js';
import Message from '../../db/models/Messages.model.js';
import { SOCKET_EVENTS } from '../socket.events.js';
import { logSocketEvent } from '../socketLogger.js';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import { config } from '../../config/index.js';
import { logger } from '../../logger.js';

/**
 * Handles message-related socket events with JWT auth (from cookies).
 */
export default function registerMessageHandlers(io) {
  io.use((socket, next) => {
    try {
      const rawCookie = socket.handshake.headers.cookie || '';
      const cookies = cookie.parse(rawCookie);
      const token = cookies['access_token'];
      if (!token) return next(new Error('Unauthorized: Missing access token'));

      const decoded = jwt.verify(token, config.jwtAccessSecret);
      socket.user = { userId: decoded.userId, email: decoded.email };
      logger.info({ socketId: socket.id, user: socket.user }, '✅ Socket authorized');
      next();
    } catch (err) {
      logger.error({ error: err.message }, '❌ Socket auth error');
      next(new Error('Unauthorized'));
    }
  });

  io.on(SOCKET_EVENTS.CONNECTION, (socket) => {
    logSocketEvent(socket, 'connection', { user: socket.user });

    socket.on(SOCKET_EVENTS.JOIN_CHAT, async (chatId) => {
      try {
        if (!chatId) return;
        const chat = await Chat.findOne({ _id: chatId, user: socket.user.userId });
        if (!chat) {
          socket.emit(SOCKET_EVENTS.ERROR_MESSAGE, 'Chat not found or access denied');
          return;
        }

        socket.join(chatId);
        logSocketEvent(socket, 'join_chat', { chatId });
      } catch (err) {
        logSocketEvent(socket, 'join_chat_error', { error: err.message }, 'error');
      }
    });

    socket.on(SOCKET_EVENTS.SEND_MESSAGE, async ({ chatId, content }) => {
      try {
        if (!chatId || !content?.trim()) return;
        logSocketEvent(socket, 'send_message', { chatId, content });

        const chat = await Chat.findOne({ _id: chatId, user: socket.user.userId });
        if (!chat) {
          socket.emit(SOCKET_EVENTS.ERROR_MESSAGE, 'Access denied');
          return;
        }

        const userMessage = await Message.create({
          chatId,
          sender: 'user',
          content: content.trim(),
          timestamp: new Date(),
        });

        await Chat.findByIdAndUpdate(chatId, {
          $push: { messages: userMessage._id },
        });

        io.to(chatId).emit(SOCKET_EVENTS.RECEIVE_MESSAGE, {
          ...userMessage.toObject(),
          chatId,
        });

        setTimeout(async () => {
          const response = await fetch('https://meowfacts.herokuapp.com/');
          const catFacts = await response.json();
          const botContent = `🤖 ${catFacts.data[0]}`;
          const botMessage = await Message.create({
            chatId,
            sender: 'bot',
            content: botContent,
            timestamp: new Date(),
          });

          await Chat.findByIdAndUpdate(chatId, {
            $push: { messages: botMessage._id },
          });

          io.to(chatId).emit(SOCKET_EVENTS.RECEIVE_MESSAGE, {
            ...botMessage.toObject(),
            chatId,
          });

          logSocketEvent(socket, 'bot_reply', { chatId, botContent });
        }, 0);
      } catch (err) {
        logSocketEvent(socket, 'send_message_error', { error: err.message }, 'error');
        socket.emit(SOCKET_EVENTS.ERROR_MESSAGE, 'Failed to send message');
      }
    });

    socket.on(SOCKET_EVENTS.DISCONNECT, (reason) => {
      logSocketEvent(socket, 'disconnect', { reason });
    });
  });
}
