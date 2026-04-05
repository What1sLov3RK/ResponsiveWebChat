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
  const { currentUser, cleanupSocketListeners, syncUser, setSearchQuery, uploadProfileImage } = chatStore;

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

  const handleImageClick = () => {
    if (currentUser) {
      document.getElementById('profile-image-input').click();
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      uploadProfileImage(file);
    }
  };

  const searchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  useEffect(() => {
    syncUser();
  }, [isModalOpen, syncUser]);

  const profileImageUrl = currentUser?.profileImage
    ? `${api.defaults.baseURL.replace('/api', '')}${currentUser.profileImage}`
    : "https://randomuser.me/api/portraits/lego/5.jpg";

  return (
    <div id="user-panel-container">
      <div id="user-profile">
        <div id="user-profile-left">
          <input
            type="file"
            id="profile-image-input"
            style={{ display: 'none' }}
            accept="image/*"
            onChange={handleFileChange}
          />
          <img
            id="profile-picture"
            src={profileImageUrl}
            alt="profile"
            onClick={handleImageClick}
            style={{ cursor: currentUser ? 'pointer' : 'default' }}
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
