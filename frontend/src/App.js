import "./css/App.css";
import UserPanel from "./components/UserPanel";
import ChatsList from "./components/ChatsList";
import ActiveChat from "./components/ActiveChat";

function App() {
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
