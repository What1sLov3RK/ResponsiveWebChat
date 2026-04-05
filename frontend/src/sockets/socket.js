import { io } from "socket.io-client";

const getSocketUrl = () => {
  const envUrl = process.env.REACT_APP_BACKEND_SOCKET_URL || process.env.REACT_APP_SOCKET_URL;
  if (envUrl && !envUrl.includes("localhost")) return envUrl;

  const { hostname, protocol } = window.location;
  if (hostname !== "localhost" && hostname !== "127.0.0.1") {
    return `${protocol}//${hostname}:4000`;
  }
  return envUrl || "http://localhost:4000";
};

const getApiUrl = () => {
  const envUrl = process.env.REACT_APP_API_URL;
  if (envUrl && !envUrl.includes("localhost")) return envUrl;

  const { hostname, protocol } = window.location;
  if (hostname !== "localhost" && hostname !== "127.0.0.1") {
    return `${protocol}//${hostname}:4000/api`;
  }
  return envUrl || "http://localhost:4000/api";
};

const SOCKET_URL = getSocketUrl();
const API_URL = getApiUrl();

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
 * Automatically retries once after token refresh if unauthorized.
 */
export const connectSocket = async (retryCount = 0) => {
  if (socket.connected) return socket;

  return new Promise((resolve, reject) => {
    const cleanup = () => {
      socket.off("connect", onConnect);
      socket.off("connect_error", onConnectError);
    };

    const onConnect = () => {
      console.log("✅ Socket handshake successful");
      cleanup();
      resolve(socket);
    };

    const onConnectError = async (err) => {
      console.warn("⚠️ Socket connect error:", err.message);
      cleanup();

      if (String(err.message).toLowerCase().includes("unauthorized") && retryCount < 1) {
        try {
          console.log("🔄 Attempting to refresh tokens (Socket)...");
          const response = await fetch(`${API_URL}/users/refresh`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
          });

          if (response.ok) {
            console.log("✅ Token refreshed, retrying socket connection...");
            resolve(connectSocket(retryCount + 1));
          } else {
            console.error("🚫 Socket refresh failed with status:", response.status);
            if (window.location.pathname !== "/") {
              window.location.replace("/");
            }
            reject(new Error("Refresh failed"));
          }
        } catch (refreshErr) {
          console.error("🚫 Socket token refresh failed:", refreshErr.message);
          reject(refreshErr);
        }
      } else {
        reject(err);
      }
    };

    socket.on("connect", onConnect);
    socket.on("connect_error", onConnectError);

    console.log("📡 Connecting socket to:", SOCKET_URL, `(attempt ${retryCount + 1})`);
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
