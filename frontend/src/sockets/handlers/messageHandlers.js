import { socket } from "../socket";
import { SOCKET_EVENTS } from "../constants/socketEvents";
import { showErrorToast } from "../../utils/toastHelper";

export const registerMessageHandlers = ({ onMessageReceived, onTyping, onUserOnline, onUserOffline, onChatCreated, onChatDeleted }) => {
  socket.on(SOCKET_EVENTS.RECEIVE_MESSAGE, onMessageReceived);
  socket.on(SOCKET_EVENTS.ERROR_MESSAGE, (msg) => showErrorToast(msg));
  socket.on(SOCKET_EVENTS.TYPING_START, (data) => onTyping(data.chatId, data.userId, true));
  socket.on(SOCKET_EVENTS.TYPING_STOP, (data) => onTyping(data.chatId, data.userId, false));
  socket.on(SOCKET_EVENTS.USER_ONLINE, (data) => onUserOnline(data));
  socket.on(SOCKET_EVENTS.USER_OFFLINE, (data) => onUserOffline(data.userId));
  socket.on(SOCKET_EVENTS.CHAT_CREATED, (data) => onChatCreated(data.chat));
  socket.on(SOCKET_EVENTS.CHAT_DELETED, (data) => onChatDeleted(data.chatId));
};

export const unregisterMessageHandlers = () => {
  socket.off(SOCKET_EVENTS.RECEIVE_MESSAGE);
  socket.off(SOCKET_EVENTS.ERROR_MESSAGE);
  socket.off(SOCKET_EVENTS.TYPING_START);
  socket.off(SOCKET_EVENTS.TYPING_STOP);
  socket.off(SOCKET_EVENTS.USER_ONLINE);
  socket.off(SOCKET_EVENTS.USER_OFFLINE);
  socket.off(SOCKET_EVENTS.CHAT_CREATED);
  socket.off(SOCKET_EVENTS.CHAT_DELETED);
};
