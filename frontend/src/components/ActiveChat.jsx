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
  const messagesEndRef = useRef(null);
  const messageContainerRef = useRef(null);
  const prevMessagesLengthRef = useRef(0);

  const scrollToBottom = (behavior = "smooth") => {
    const endEl = messagesEndRef.current;
    if (endEl) {
      endEl.scrollIntoView({ behavior });
    }
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
    if (chat) setTimeout(() => scrollToBottom("auto"), 50);
  }, [chat?._id]);

  useEffect(() => {
    const messages = chat?.messages || [];
    const prevLen = prevMessagesLengthRef.current;
    const newLen = messages.length;
    const nearBottom = isUserNearBottom();
    const newMessagesAdded = newLen > prevLen;

    if (newMessagesAdded && nearBottom) {
      scrollToBottom("smooth");
    }

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

  const renderMessages = () => {
    if (!chat?.messages?.length)
      return (
        <p style={{ color: "#888", textAlign: "center", marginTop: "20px" }}>
          No messages yet
        </p>
      );

    return chat.messages.map((m) => {
      const isUser = m.sender === "user";
      const date = new Date(m.timestamp || m.createdAt);
      const formattedDate = date.toLocaleString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        month: "short",
        day: "numeric",
      });

      return (
        <div
          key={m._id ?? Math.random()}
          className={`message-item-container ${isUser ? "from-user" : "from-bot"}`}
        >
          {!isUser && (
            <img
              src="https://xsgames.co/randomusers/assets/avatars/male/38.jpg"
              alt="bot-avatar"
            />
          )}
          <div className="message-item">
            <div className={isUser ? "user-message" : "bot-message"}>
              {m.content}
            </div>
            <span
              className={
                isUser ? "user-message-date message-date" : "message-date"
              }
            >
              {formattedDate}
            </span>
          </div>
        </div>
      );
    });
  };

  return (
    <div id="active-chat">
      <div id="chat-name">
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
    </div>
  );
});

export default ActiveChat;
