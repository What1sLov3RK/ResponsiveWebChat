import { io } from "socket.io-client";

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:4000";

export const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  autoConnect: true,
});

socket.on("connect", () => console.log("⚡️ Socket connected:", socket.id));
socket.on("disconnect", () => console.log("❌ Socket disconnected"));
socket.onAny((event, ...args) => console.log("📡 Outgoing event:", event, args));

export const connectSocket = () => socket.connect();
export const disconnectSocket = () => socket.disconnect();

window.socket = socket;
