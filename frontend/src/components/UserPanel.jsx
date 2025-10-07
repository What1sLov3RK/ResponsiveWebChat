import "../css/userPanel.css";
import Button from "./Button";
import { useState, useEffect } from "react";
import AuthModal from "./AuthModal";
import Input from "./Input";
import chatStore from "../chatStore";

const UserPanel = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [user, setUser] = useState(null);

  const { setChats, setSelectedChat } = chatStore;
  const openLoginModal = () => {
    setIsSignup(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("access-token");
    localStorage.removeItem("refresh-token");
    localStorage.removeItem("authorized");
    localStorage.removeItem("user-info");
    chatStore.setChats([]);
    setUser(null);
  };

  const searchChange = (event) => {
    chatStore.setSearchQuery(event.target.value);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user-info");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
        setSelectedChat(null);
        setChats([]);

      }
    }
  }, [isModalOpen]);

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
            {user ? `${user.firstname} ${user.lastname}` : "Guest"}
          </span>
        </div>

        {user ? (
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
};

export default UserPanel;
