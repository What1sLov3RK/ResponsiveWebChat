import { useEffect } from "react";
import "./css/App.css";
import UserPanel from "./components/UserPanel";
import ChatsList from "./components/ChatsList";
import ActiveChat from "./components/ActiveChat";
import { socket, connectSocket, disconnectSocket } from "./services/socket";

function App() {
  useEffect(() => {
    const token = localStorage.getItem("access-token");
    connectSocket(token);

    socket.on("connect", () => console.log("✅ Connected to Socket.IO"));
    socket.on("disconnect", () => console.log("🔌 Disconnected from Socket.IO"));
    socket.on("newMessage", (msg) => {
      console.log("📩 New message received:", msg);
    });

    return () => disconnectSocket();
  }, []);

  return (
    <div id="main-container">
      <div id="user-chats-container">
        <UserPanel />
        <ChatsList />
      </div>
      <div id="chat-container">
        <ActiveChat />
      </div>
    </div>
  );
}

export default App;
