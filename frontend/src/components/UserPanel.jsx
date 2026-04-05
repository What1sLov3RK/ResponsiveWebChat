import "../css/userPanel.css";
import Button from "./Button";
import { useState, useEffect } from "react";
import AuthModal from "./AuthModal";
import Input from "./Input";
import chatStore from "../stores/chatStore";
import { observer } from "mobx-react-lite";
import api from '../api';

const UserPanel = observer(() => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const { currentUser, setSelectedChat, cleanupSocketListeners, syncUser, setSearchQuery } = chatStore;

  const openLoginModal = () => {
    setIsSignup(false);
    setIsModalOpen(true);
  };
  const closeModal = () => setIsModalOpen(false);

  const handleLogout = () => {
    api.get('users/logout')
    localStorage.removeItem("authorized");
    localStorage.removeItem("user-info");
    chatStore.chats = [];
    chatStore.selectedChat = null;
    cleanupSocketListeners();
    chatStore.currentUser = null;
  };

  const searchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  useEffect(() => {
    syncUser();
  }, [isModalOpen, syncUser]);

  return (
    <div id="user-panel-container">
      <div id="user-profile">
        <div id="user-profile-left">
          <img
            id="profile-picture"
            src="https://randomuser.me/api/portraits/lego/5.jpg"
            alt="profile"
          />
          <span className="user-name">
            {currentUser ? `${currentUser.firstname} ${currentUser.lastname}` : "Guest"}
          </span>
        </div>

        {currentUser ? (
          <Button onClick={handleLogout} name="Log Out" />
        ) : (
          <Button onClick={openLoginModal} name="Log In" />
        )}

        {isModalOpen && (
          <AuthModal
            onClose={closeModal}
            isSignup={isSignup}
            switchToSignup={() => setIsSignup(true)}
            switchToLogin={() => setIsSignup(false)}
          />
        )}
      </div>

      <div id="input-search-chat-container">
        <Input placeholder="Search chat" onChange={searchChange} />
      </div>
    </div>
  );
});

export default UserPanel;
