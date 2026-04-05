import React, { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import chatStore from "../stores/chatStore";
import Button from "./Button";
import CreateChatModal from "./CreateChatModal";
import "../css/chats.css";

const ChatsList = observer(() => {
  const { sortedChats, fetchChats, setSelectedChat, selectedChat, currentUser, onlineUsers, typingStatus } = chatStore;
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

  const isOnline = (chat) => {
    if (!chat) return false;
    if (chat.isBot) return true;
    const myId = String(currentUser?._id || currentUser?.id || "");
    if (!myId) return false;
    const other = chat.participants?.find((p) => String(p._id || p) !== myId);
    const otherId = other?._id || other;
    return otherId && !!onlineUsers[String(otherId)];
  };

  const isTyping = (chat) => {
    const typingIds = typingStatus[chat._id] || [];
    return typingIds.length > 0;
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

  const getChatName = (chat) => {
    if (!chat) return "";
    if (chat.isBot || !chat.participants) return chat.name;
    const myId = String(currentUser?._id || currentUser?.id || "");
    if (!myId) return chat.name;
    const other = chat.participants.find((p) => String(p._id || p) !== myId);
    return other && other.firstname ? `${other.firstname} ${other.lastname}` : chat.name;
  };

  const chats = Array.isArray(sortedChats) ? sortedChats : [];
  const reversedChats = chats; // Already sorted by updatedAt desc

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
            const chatIsTyping = isTyping(chat);
            
            return (
              <div
                key={chat._id}
                onClick={() => handleChatClick(chat)}
                className={`chat-item ${
                  selectedChat && selectedChat._id === chat._id ? "active" : ""
                }`}
              >
                <div className="avatar-container">
                  <img
                    className="chat-logo"
                    src="https://randomuser.me/api/portraits/lego/5.jpg"
                    alt="chat avatar"
                  />
                  {isOnline(chat) && <span className="online-indicator"></span>}
                </div>
                <div className="chat-name-message">
                  <span className="chat-name">{getChatName(chat)}</span>
                  <br />
                  <div className="recent-message-container">
                    {chatIsTyping ? (
                      <p className="truncate-text typing-text-list">
                        is typing...
                      </p>
                    ) : (
                      <p className="truncate-text">
                        {lastMessage ? String(lastMessage.content) : ""}
                      </p>
                    )}
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
