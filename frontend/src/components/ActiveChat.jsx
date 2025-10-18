import React, { useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import chatStore from "../stores/chatStore";
import "../css/activeChat.css";
import ChatInput from "./ChatInput";
import ChangeChatNameModal from "./ChangeChatNameModal";
import { toast } from "react-toastify";

const SCROLL_THRESHOLD = 150;

const ActiveChat = observer(() => {
  const { selectedChat, chats, sendUserMessage } = chatStore;
  const chat = chats.find((c) => c._id === selectedChat?._id) || selectedChat;

  const [newMessage, setNewMessage] = useState("");
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  const messagesEndRef = useRef(null);
  const messageContainerRef = useRef(null);
  const prevMessagesLengthRef = useRef(0);

  const scrollToBottom = (behavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  const isUserNearBottom = () => {
    const container = messageContainerRef.current;
    if (!container) return true;
    const distance =
      container.scrollHeight - (container.scrollTop + container.clientHeight);
    return distance < SCROLL_THRESHOLD;
  };

  useEffect(() => {
    prevMessagesLengthRef.current = chat?.messages?.length || 0;
    if (chat) setTimeout(() => scrollToBottom("auto"), 10);
  }, [chat?._id]);

  useEffect(() => {
    chatStore.initSocket()
    const messages = chat?.messages || [];
    const prevLen = prevMessagesLengthRef.current;
    const newLen = messages.length;
    const nearBottom = isUserNearBottom();
    if (newLen > prevLen && nearBottom) scrollToBottom("smooth");
    prevMessagesLengthRef.current = newLen;
  }, [chat?.messages?.length]);

  const handleSend = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!chat?._id) return toast.info("Select a chat first");
      if (!newMessage.trim()) return toast.info("Write something first");

      const msg = newMessage.trim();
      setNewMessage("");
      sendUserMessage(chat._id, msg);
      setTimeout(() => scrollToBottom("smooth"), 10);
    }
  };

  const toggleSidebar = () => {
    const sidebar = document.getElementById("user-chats-container");
    const overlay = document.getElementById("sidebar-overlay");

    if (!sidebar || !overlay) return;

    if (isSidebarVisible) {
      sidebar.classList.remove("visible");
      overlay.classList.remove("visible");
      setIsSidebarVisible(false);
    } else {
      sidebar.classList.add("visible");
      overlay.classList.add("visible");
      setIsSidebarVisible(true);
    }
  };

  const handleOverlayClick = () => {
    const sidebar = document.getElementById("user-chats-container");
    const overlay = document.getElementById("sidebar-overlay");
    sidebar?.classList.remove("visible");
    overlay?.classList.remove("visible");
    setIsSidebarVisible(false);
  };

  return (
    <div id="active-chat">
      <div
        id="chat-name"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          justifyContent: "flex-start",
          padding: "0 10px",
        }}
      >

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
            <div id="change-chat-name" onClick={() => setShowRenameModal(true)} />
          </>
        ) : (
          <h2 style={{ color: "deepskyblue", marginLeft: 10 }}>
            Select or create a chat
          </h2>
        )}
      </div>
      <div id="message-container" ref={messageContainerRef}>
        {chat?.messages?.length ? (
          chat.messages.map((m) => {
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
          })
        ) : (
          <p style={{ textAlign: "center", color: "#999" }}>No messages yet</p>
        )}
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
