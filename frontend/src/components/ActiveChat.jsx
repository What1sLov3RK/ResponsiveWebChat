import React, { useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import chatStore from "../stores/chatStore";
import "../css/activeChat.css";
import ChatInput from "./ChatInput";
import ChangeChatNameModal from "./ChangeChatNameModal";
import { showInfoToast } from "../utils/toastHelper";

const SCROLL_THRESHOLD = 150;

const ActiveChat = observer(() => {
  const { selectedChat, chats, sendUserMessage, isBotTyping, isSidebarVisible, setIsSidebarVisible } = chatStore;
  const chat = chats.find((c) => c._id === selectedChat?._id) || selectedChat;

  const [newMessage, setNewMessage] = useState("");
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const messageContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

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

  const handleScroll = () => {
    setShowScrollButton(!isUserNearBottom());
  };

  useEffect(() => {
    if (!chat?.messages) return;
    const nearBottom = isUserNearBottom();
    if (nearBottom) scrollToBottom(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat?.messages?.length]);

  useEffect(() => {
    if (chat?._id) {
      scrollToBottom(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [chat?._id]);

  useEffect(() => {
    if (isBotTyping) {
      scrollToBottom(true);
    }
  }, [isBotTyping]);

  const handleSend = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!chat?._id) return showInfoToast("Select a chat first");
      if (!newMessage.trim()) return showInfoToast("Write something first");

      const msg = newMessage.trim();
      setNewMessage("");
      sendUserMessage(chat._id, msg);
      setTimeout(() => scrollToBottom(true), 20);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  const renderMessages = () => {
    if (!chat?.messages?.length && !isBotTyping)
      return (
        <div className="empty-chat-state">
          <p>No messages yet. Say hi! 👋</p>
        </div>
      );

    const messageList = chat?.messages?.map((m) => {
      const isUser = m.sender === "user";
      const time = new Date(m.timestamp || m.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      return (
        <div
          key={m._id ?? Math.random()}
          className={`message-item-container ${isUser ? "from-user" : "from-bot"} animate-message`}
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
            <span className={`message-date ${isUser ? "user-message-date" : ""}`}>{time}</span>
          </div>
        </div>
      );
    }) || [];

    if (isBotTyping) {
      messageList.push(
        <div key="typing" className="message-item-container from-bot typing-indicator-container">
          <img
            src="https://xsgames.co/randomusers/assets/avatars/male/38.jpg"
            alt="bot"
          />
          <div className="message-item">
            <div className="bot-message typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      );
    }

    return messageList;
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
            <div className="chat-header-info">
              <h2>{chat.name}</h2>
              {isBotTyping && <span className="typing-text">bot is typing...</span>}
            </div>
            <div
              id="change-chat-name"
              onClick={() => setShowRenameModal(true)}
            />
          </>
        ) : (
          <h2 className="select-chat-hint">
            Select or create a chat to start messaging
          </h2>
        )}
      </div>

      <div id="message-container" ref={messageContainerRef} onScroll={handleScroll}>
        {renderMessages()}
        <div ref={messagesEndRef} />
      </div>

      {showScrollButton && (
        <button className="scroll-bottom-btn" onClick={() => scrollToBottom(true)}>
          ↓
        </button>
      )}

      {chat && (
        <div id="chat-input-container">
          <ChatInput
            ref={inputRef}
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
    </div>
  );
});

export default ActiveChat;
