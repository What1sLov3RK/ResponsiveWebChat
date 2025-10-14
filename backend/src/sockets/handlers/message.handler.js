import Chat from '../../db/models/Chats.model.js';
import Message from '../../db/models/Messages.model.js';
import { SOCKET_EVENTS } from '../socket.events.js';
import { logSocketEvent } from '../socketLogger.js';

/**
 * Handles message-related socket events.
 */

export default function registerMessageHandlers(io) {
  io.on(SOCKET_EVENTS.CONNECTION, (socket) => {
    logSocketEvent(socket, 'connection');

    socket.on(SOCKET_EVENTS.JOIN_CHAT, (chatId) => {
      if (!chatId) return;
      socket.join(chatId);
      logSocketEvent(socket, 'join_chat', { chatId });
    });

    socket.on(SOCKET_EVENTS.SEND_MESSAGE, async ({ chatId, content }) => {
      try {
        if (!chatId || !content?.trim()) return;
        logSocketEvent(socket, 'send_message', { chatId, content });

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
          const botContent = `🤖 Got it! You said: "${content}"`;
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
        }, 10);
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
