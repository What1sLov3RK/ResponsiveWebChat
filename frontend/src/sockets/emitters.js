import { socket } from "./socket";
import { SOCKET_EVENTS } from "./constants/socketEvents";

export const emitJoinChat = (chatId) => {
  socket.emit(SOCKET_EVENTS.JOIN_CHAT, chatId);
  console.log("📡 Emitted JOIN_CHAT:", chatId);
};

export const emitSendMessage = (chatId, content) => {
  socket.emit(SOCKET_EVENTS.SEND_MESSAGE, { chatId, content });
  console.log("📡 Emitted SEND_MESSAGE:", { chatId, content });
};