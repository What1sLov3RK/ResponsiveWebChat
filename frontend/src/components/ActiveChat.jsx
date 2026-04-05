import React, { useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import chatStore from "../stores/chatStore";
import "../css/activeChat.css";
import ChatInput from "./ChatInput";
import ChangeChatNameModal from "./ChangeChatNameModal";
import { showInfoToast } from "../utils/toastHelper";

const SCROLL_THRESHOLD = 150;

const ActiveChat = observer(() => {
  const { selectedChat, chats, sendUserMessage, isBotTyping, typingStatus, isSidebarVisible, setIsSidebarVisible, currentUser, onlineUsers } = chatStore;
  const chat = chats.find((c) => c._id === selectedChat?._id) || selectedChat;

  const typingUserIds = typingStatus[chat?._id] || [];
  const isSomeoneTyping = isBotTyping || typingUserIds.length > 0;

  const isOnline = (chat) => {
    if (!chat) return false;
    if (chat.isBot) return true;
    const myId = String(currentUser?._id || currentUser?.id || "");
    if (!myId) return false;
    const other = chat.participants?.find((p) => String(p._id || p) !== myId);
    const otherId = other?._id || other;
    return otherId && !!onlineUsers[String(otherId)];
  };

  const getChatName = (chat) => {
    if (!chat) return "";
    if (chat.isBot || !chat.participants) return chat.name;
    const myId = String(currentUser?._id || currentUser?.id || "");
    if (!myId) return chat.name;
    const other = chat.participants.find((p) => String(p._id || p) !== myId);
    return other && other.firstname ? `${other.firstname} ${other.lastname}` : chat.name;
  };

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
    if (isBotTyping || typingUserIds.length > 0) {
      scrollToBottom(true);
    }
  }, [isBotTyping, typingUserIds.length]);

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
    if (!chat?.messages?.length && !isSomeoneTyping)
      return (
        <div className="empty-chat-state">
          <p>No messages yet. Say hi! 👋</p>
        </div>
      );

    const messageList = chat?.messages?.map((m) => {
      const myId = String(currentUser?._id || currentUser?.id || "");
      const isMe =
        m.sender === "user" &&
        myId && String(m.senderId || m.userId || "") === myId;
      const isBot = m.sender === "bot";
      const isOtherUser = m.sender === "user" && !isMe;
      
      const time = new Date(m.timestamp || m.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      let bubbleClass = "bot-message";
      if (isMe) bubbleClass = "user-message";
      if (isOtherUser) bubbleClass = "other-user-message";

      let containerClass = "from-others";
      if (isMe) containerClass = "from-me";

      return (
        <div
          key={m._id ?? Math.random()}
          className={`message-item-container ${containerClass} animate-message`}
        >
          {!isMe && (
            <img
              src={isBot ? "https://xsgames.co/randomusers/assets/avatars/male/38.jpg" : "https://randomuser.me/api/portraits/lego/5.jpg"}
              alt="avatar"
              className={isBot ? "bot-avatar" : "user-avatar"}
            />
          )}
          <div className="message-item">
            <div className={bubbleClass}>
              {m.content}
            </div>
            <span className={`message-date ${isMe ? "user-message-date" : ""}`}>{time}</span>
          </div>
        </div>
      );
    }) || [];

    if (isSomeoneTyping) {
      const typingUser = chat?.participants?.find(p => typingUserIds.includes(String(p._id || p)));
      const avatarUrl = isBotTyping 
        ? "https://xsgames.co/randomusers/assets/avatars/male/38.jpg" 
        : "https://randomuser.me/api/portraits/lego/5.jpg";

      messageList.push(
        <div key="typing" className="message-item-container from-others typing-indicator-container">
          <img
            src={avatarUrl}
            alt="typing"
            className={isBotTyping ? "bot-avatar" : "user-avatar"}
          />
          <div className="message-item">
            <div className={`${isBotTyping ? 'bot-message' : 'other-user-message'} typing-indicator`}>
              <span></span>
              <span></span>
              <span></span>
            </div>
            {typingUser && <span className="message-date">{typingUser.firstname} is typing...</span>}
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
              <h2>{getChatName(chat)}</h2>
              <span className={`status-text ${isOnline(chat) ? 'online' : 'offline'}`}>
                {isSomeoneTyping ? (
                  <span className="typing-text">
                    {isBotTyping ? 'bot' : 'someone'} is typing...
                  </span>
                ) : (
                  isOnline(chat) ? 'online' : 'offline'
                )}
              </span>
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
            chatId={chat._id}
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
