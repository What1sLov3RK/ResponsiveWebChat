import React, { useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import chatStore from "../stores/chatStore";
import "../css/activeChat.css";
import ChatInput from "./ChatInput";
import ChangeChatNameModal from "./ChangeChatNameModal";
import { toast } from "react-toastify";

const SCROLL_THRESHOLD = 150;

const ActiveChat = observer(() => {
  const { selectedChat, chats, sendUserMessage, initSocket } = chatStore;
  const chat = chats.find((c) => c._id === selectedChat?._id) || selectedChat;

  const [newMessage, setNewMessage] = useState("");
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  const messageContainerRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
    });
  };

  const isUserNearBottom = () => {
    const container = messageContainerRef.current;
    if (!container) return true;
    const distance =
      container.scrollHeight - (container.scrollTop + container.clientHeight);
    return distance < SCROLL_THRESHOLD;
  };

  useEffect(() => {
    initSocket();
  }, [initSocket]);

  useEffect(() => {
    if (!chat?.messages) return;
    const nearBottom = isUserNearBottom();
    if (nearBottom) scrollToBottom(true);
  }, [chat?.messages?.length]);

  useEffect(() => {
    if (chat?._id) scrollToBottom(false);
  }, [chat?._id]);

  const handleSend = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!chat?._id) return toast.info("Select a chat first");
      if (!newMessage.trim()) return toast.info("Write something first");

      const msg = newMessage.trim();
      setNewMessage("");
      sendUserMessage(chat._id, msg);
      setTimeout(() => scrollToBottom(true), 20);
    }
  };

  const toggleSidebar = () => {
    const sidebar = document.getElementById("user-chats-container");
    const overlay = document.getElementById("sidebar-overlay");
    if (!sidebar || !overlay) return;

    const visible = !isSidebarVisible;
    sidebar.classList.toggle("visible", visible);
    overlay.classList.toggle("visible", visible);
    setIsSidebarVisible(visible);
  };

  const handleOverlayClick = () => {
    const sidebar = document.getElementById("user-chats-container");
    const overlay = document.getElementById("sidebar-overlay");
    sidebar?.classList.remove("visible");
    overlay?.classList.remove("visible");
    setIsSidebarVisible(false);
  };

  const renderMessages = () => {
    if (!chat?.messages?.length)
      return (
        <p style={{ textAlign: "center", color: "#999" }}>No messages yet</p>
      );

    return chat.messages.map((m) => {
      const isUser = m.sender === "user";
      const time = new Date(m.timestamp || m.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      return (
        <div
          key={m._id ?? Math.random()}
          className={`message-item-container ${isUser ? "from-user" : "from-bot"}`}
        >
          {!isUser && (
            <img
              src="https://xsgames.co/randomusers/assets/avatars/male/38.jpg"
              alt="bot"
            />
          )}
          <div className="message-item">
            <div className={isUser ? "user-message" : "bot-message"}>
              {m.content}
            </div>
            <span className="message-date">{time}</span>
          </div>
        </div>
      );
    });
  };

  return (
    <div id="active-chat">
      <div id="chat-name">
        <button id="toggle-sidebar" onClick={toggleSidebar}>
          ☰
        </button>

        {chat ? (
          <>
            <img
              src="https://xsgames.co/randomusers/assets/avatars/male/38.jpg"
              alt="chat"
            />
            <h2>{chat.name}</h2>
            <div
              id="change-chat-name"
              onClick={() => setShowRenameModal(true)}
            />
          </>
        ) : (
          <h2 style={{ color: "deepskyblue", marginLeft: 10 }}>
            Select or create a chat
          </h2>
        )}
      </div>

      <div id="message-container" ref={messageContainerRef}>
        {renderMessages()}
        <div ref={messagesEndRef} />
      </div>

      {chat && (
        <div id="chat-input-container">
          <ChatInput
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleSend}
          />
        </div>
      )}

      {showRenameModal && (
        <div id="modal-layer" role="dialog" aria-modal="true">
          <ChangeChatNameModal onClose={() => setShowRenameModal(false)} />
        </div>
      )}

      <div id="sidebar-overlay" onClick={handleOverlayClick}></div>
    </div>
  );
});

export default ActiveChat;
