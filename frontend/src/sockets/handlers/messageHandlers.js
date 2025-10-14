import { socket } from "../socket";
import { SOCKET_EVENTS } from "../constants/socketEvents";
import { toast } from "react-toastify";

export const registerMessageHandlers = (onMessageReceived) => {
  socket.on(SOCKET_EVENTS.RECEIVE_MESSAGE, onMessageReceived);
  socket.on(SOCKET_EVENTS.ERROR_MESSAGE, (msg) => toast.error(msg));
};

export const unregisterMessageHandlers = () => {
  socket.off(SOCKET_EVENTS.RECEIVE_MESSAGE);
  socket.off(SOCKET_EVENTS.ERROR_MESSAGE);
};

export const emitJoinChat = (chatId) => {
  socket.emit(SOCKET_EVENTS.JOIN_CHAT, chatId);
};

export const emitLeaveChat = (chatId) => {
  socket.emit(SOCKET_EVENTS.LEAVE_CHAT, chatId);
};

export const emitSendMessage = (chatId, content) => {
  socket.emit(SOCKET_EVENTS.SEND_MESSAGE, { chatId, content });
};
