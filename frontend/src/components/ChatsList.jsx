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
    fetchChats();
  }, []);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleChatClick = (chat) => {
    setSelectedChat(chat);

  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
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
          <p className="no-chats-placeholder"></p>
        )}
      </div>
    </div>
  );
});

export default ChatsList;
