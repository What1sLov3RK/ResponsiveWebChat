import React, { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import chatStore from "../stores/chatStore";
import Button from "./Button";
import CreateChatModal from "./CreateChatModal";
import "../css/chats.css";

const ChatsList = observer(() => {
  const { filteredChats, fetchChats, setSelectedChat, selectedChat } = chatStore;
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if(localStorage.getItem('authorized') === 'true') {
      fetchChats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleChatClick = (chat) => {
    setSelectedChat(chat);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const oneDay = 24 * 60 * 60 * 1000;

    if (diff < oneDay && now.getDate() === date.getDate()) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    if (diff < 2 * oneDay) {
      return "Yesterday";
    }
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const chats = Array.isArray(filteredChats) ? filteredChats : [];
  const reversedChats = [...chats].reverse();

  return (
    <div id="chats-container">
      <div className="chats-head">
        <span>Chats</span>
        <Button name="+" onClick={openModal} className={'create-chat-button'}/>
        {isModalOpen && <CreateChatModal onClose={closeModal} />}
      </div>

      <div className="chat-list">
        {reversedChats.length > 0 ? (
          reversedChats.map((chat) => {
            const lastMessage = chat.messages?.[chat.messages.length - 1];
            return (
              <div
                key={chat._id}
                onClick={() => handleChatClick(chat)}
                className={`chat-item ${
                  selectedChat && selectedChat._id === chat._id ? "active" : ""
                }`}
              >
                <img
                  className="chat-logo"
                  src="https://randomuser.me/api/portraits/lego/5.jpg"
                  alt="chat avatar"
                />
                <div className="chat-name-message">
                  <span className="chat-name">{chat.name}</span>
                  <br />
                  <div className="recent-message-container">
                    <p className="truncate-text">
                      {lastMessage ? String(lastMessage.content) : ""}
                    </p>
                    <span className="recent-message-timestamp">
                      {lastMessage ? formatDate(lastMessage.timestamp) : ""}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-chats-placeholder">
            <p>No chats found.</p>
            <p style={{ fontSize: '0.8rem' }}>Create one to start!</p>
          </div>
        )}
      </div>
    </div>
  );
});

export default ChatsList;
