import { io } from "socket.io-client";

const SOCKET_URL = process.env.REACT_APP_BACKEND_SOCKET_URL || "http://localhost:4000";
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4000/api";

export const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  withCredentials: true,
  autoConnect: false,
});

socket.on("connect", () => console.log("⚡️ Socket connected:", socket.id));
socket.on("disconnect", (reason) => console.log("❌ Socket disconnected:", reason));
socket.on("connect_error", (err) => console.error("🚫 Socket connect error:", err.message));
socket.onAny((event, ...args) => console.log("📡 Event:", event, args));

/**
 * Connects socket with JWT cookie handshake.
 * Automatically retries after token refresh if needed.
 */
export const connectSocket = async () => {
  if (socket.connected) return console.log("⚡️ Already connected");

  return new Promise((resolve, reject) => {
    socket.once("connect", () => {
      console.log("✅ Socket handshake successful");
      resolve(socket);
    });

    socket.once("connect_error", async (err) => {
      console.warn("⚠️ Socket connect error:", err.message);

      if (String(err.message).toLowerCase().includes("unauthorized")) {
        try {
          console.log("🔄 Attempting to refresh tokens...");
          const response = await fetch(`${API_URL}/users/refresh`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
          });

          if (response.ok) {
            console.log("✅ Token refreshed, reconnecting socket...");
            socket.connect();
          } else {
            console.error("🚫 Refresh failed with status:", response.status);
            reject(new Error("Refresh failed"));
          }
        } catch (refreshErr) {
          console.error("🚫 Token refresh failed:", refreshErr.message);
          reject(refreshErr);
        }
      } else {
        reject(err);
      }
    });

    console.log("📡 Connecting socket to:", SOCKET_URL);
    socket.connect();
  });
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
    console.log("🔌 Socket disconnected manually");
  }
};

window.socket = socket;
