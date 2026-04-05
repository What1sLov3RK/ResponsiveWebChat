import { useEffect } from "react";
import { observer } from "mobx-react-lite";
import chatStore from "./stores/chatStore";
import "./css/App.css";
import UserPanel from "./components/UserPanel";
import ChatsList from "./components/ChatsList";
import ActiveChat from "./components/ActiveChat";

const App = observer(() => {
  const { isSidebarVisible, setIsSidebarVisible, initSocket } = chatStore;

  useEffect(() => {
    initSocket();
    
    function setAppHeight() {
      document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
    }
    window.addEventListener('resize', setAppHeight);
    setAppHeight();

    return () => {
      window.removeEventListener('resize', setAppHeight);
    }
  }, [initSocket]);

  return (
    <div id="main-container">
      <div id="sidebar-overlay" className={isSidebarVisible ? "visible" : ""} onClick={() => setIsSidebarVisible(false)} />
      <div id="user-chats-container" className={isSidebarVisible ? "visible" : ""}>
        <UserPanel />
        <ChatsList />
      </div>
      <div id="chat-container">
        <ActiveChat />
      </div>
    </div>
  );
});

export default App;
