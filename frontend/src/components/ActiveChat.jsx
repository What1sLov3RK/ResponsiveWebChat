import React, { useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import chatStore from "../chatStore";
import "../css/activeChat.css";
import ChatInput from "./ChatInput";
import { toast } from "react-toastify";
import ChangeChatNameModal from "./ChangeChatNameModal";

const SCROLL_THRESHOLD = 150;

const ActiveChat = observer(() => {
  const { selectedChat, sendUserMessage } = chatStore;

  useEffect(() => {
    if (selectedChat && window.innerWidth <= 768) {
      const sidebar = document.getElementById("user-chats-container");
      const overlay = document.getElementById("sidebar-overlay");
      sidebar?.classList.remove("visible");
      overlay?.classList.remove("visible");
    }
  }, [selectedChat]);

  const [changeChatNameModal, setChangeChatNameModal] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  const messageContainerRef = useRef(null);
  const prevMessagesLengthRef = useRef(0);

  const toggleSidebar = () => {
    const sidebar = document.getElementById("user-chats-container");
    const overlay = document.getElementById("sidebar-overlay");
    sidebar?.classList.toggle("visible");
    overlay?.classList.toggle("visible");
  };

  const closeSidebar = () => {
    const sidebar = document.getElementById("user-chats-container");
    const overlay = document.getElementById("sidebar-overlay");
    sidebar?.classList.remove("visible");
    overlay?.classList.remove("visible");
  };

  const changeMessage = (e) => setNewMessage(e.target.value);

  const scrollToBottom = (behavior = "smooth") => {
    const container = messageContainerRef.current;
    const endEl = messagesEndRef.current;
    if (container && endEl) {
      requestAnimationFrame(() => {
        setTimeout(() => {
          try {
            endEl.scrollIntoView({ behavior, block: "end", inline: "nearest" });
          } catch {
            container.scrollTop = container.scrollHeight;
          }
        }, 20);
      });
    }
  };

  const isUserNearBottom = () => {
    const container = messageContainerRef.current;
    if (!container) return true;
    const distance = container.scrollHeight - (container.scrollTop + container.clientHeight);
    return distance < SCROLL_THRESHOLD;
  };

  const sendNewMessage = async (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!selectedChat) return toast.info("Select a chat first");
      if (!newMessage.trim()) return toast.info("Write something first");

      const msg = newMessage.trim();
      setNewMessage("");
      await sendUserMessage(selectedChat._id, msg);
      setTimeout(() => scrollToBottom("smooth"), 30);
    }
  };

  useEffect(() => {
    prevMessagesLengthRef.current = selectedChat?.messages?.length || 0;
    setTimeout(() => scrollToBottom("auto"), 30);
  }, [selectedChat?._id]);

  useEffect(() => {
    const messages = selectedChat?.messages || [];
    const prevLen = prevMessagesLengthRef.current;
    const newLen = messages.length;
    const nearBottom = isUserNearBottom();
    const isInitial = prevLen === 0 && newLen > 0;
    const appended = newLen > prevLen;
    if (isInitial || (appended && nearBottom)) {
      const behavior = isInitial ? "auto" : "smooth";
      scrollToBottom(behavior);
    }
    prevMessagesLengthRef.current = newLen;
  }, [selectedChat?.messages?.length]);

  useEffect(() => {
    const onResize = () => {
      if (isUserNearBottom()) scrollToBottom("auto");
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);



  return (
    <div id="active-chat">
      <div id="sidebar-overlay" onClick={closeSidebar}></div>

      <div id="chat-name">
        <button id="toggle-sidebar" onClick={toggleSidebar}>☰</button>
        {selectedChat ? (
          <>
            <img src="https://xsgames.co/randomusers/assets/avatars/male/38.jpg" alt="chat-logo" />
            <h2>{selectedChat.name}</h2>
            <div id="change-chat-name" onClick={() => setChangeChatNameModal(true)} />
          </>
        ) : (
          <h2 style={{ color: "deepskyblue", fontWeight: 500, marginLeft: 10 }}>
            Select or create a chat
          </h2>
        )}
      </div>

      <div id="message-container" ref={messageContainerRef}>
        {selectedChat?.messages?.length ? (
          selectedChat.messages.map((message) => {
            const isUser = message.sender === "user";
            const date = new Date(message.timestamp);
            const formattedDate = date.toLocaleString("en-US", {
              year: "numeric",
              month: "numeric",
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
              hour12: true,
            });

            return (
              <div
                key={message._id ?? message.id ?? Math.random()}
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
                    {message.content}
                  </div>
                  <span className={isUser ? "user-message-date message-date" : "message-date"}>
                    {formattedDate}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <p style={{ color: "#888", textAlign: "center", marginTop: "20px" }}>
            No messages yet
          </p>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div id="chat-input-container">
        {selectedChat && (
          <ChatInput
            placeholder="Type your message"
            value={newMessage}
            onChange={changeMessage}
            onKeyDown={sendNewMessage}
            className="message-input"
          />
        )}
      </div>

      {changeChatNameModal && (
        <div id="modal-layer" role="dialog" aria-modal="true">
          <ChangeChatNameModal onClose={() => setChangeChatNameModal(false)} />
        </div>
      )}
    </div>
  );
});

export default ActiveChat;
