import { makeAutoObservable, runInAction } from "mobx";
import api from "../api";
import { showErrorToast, showSuccessToast, showInfoToast } from "../utils/toastHelper";
import { connectSocket, disconnectSocket, socket } from "../sockets/socket";
import { registerMessageHandlers, unregisterMessageHandlers } from "../sockets/handlers/messageHandlers";
import { emitJoinChat, emitSendMessage } from "../sockets/emitters";

class ChatStore {
  chats = [];
  selectedChat = null;
  searchQuery = "";
  error = null;
  isBotTyping = false;
  isSidebarVisible = false;
  _socketInitialized = false;

  constructor() {
    makeAutoObservable(this);
  }

  initSocket = () => {
    if (localStorage.getItem('authorized') === 'true') {
      if (this._socketInitialized) return;

      socket.on("connect", () => console.log("⚡️ Socket connected:", socket.id));
      connectSocket().catch((err) => {
        console.error("Failed to connect socket:", err);
      });
      registerMessageHandlers(this.handleIncomingMessage);

      this._socketInitialized = true;
    }
  }

  cleanupSocketListeners = () => {
    if (!this._socketInitialized) return;

    unregisterMessageHandlers();
    disconnectSocket();

    this._socketInitialized = false;
    console.log("🧹 Socket listeners cleaned up");
  };

  handleIncomingMessage = (message) => {
    runInAction(() => {
      const chatIndex = this.chats.findIndex((c) => c._id === message.chatId);
      if (chatIndex !== -1) {
        const updatedChat = {
          ...this.chats[chatIndex],
          messages: [...(this.chats[chatIndex].messages || []), message],
        };
        this.chats[chatIndex] = updatedChat;

        if (this.selectedChat && this.selectedChat._id === message.chatId) {
          this.selectedChat = updatedChat;
        }

      if (message.sender === "bot") {
        this.isBotTyping = false;
        if (this.selectedChat?._id !== message.chatId) {
          showInfoToast(message.content, { autoClose: 1500 });
        }
      }
      } else {
        console.warn(" Received message for unknown chat:", message.chatId);
      }
    });
  };

  setSearchQuery = (q) => {
    this.searchQuery = q.toLowerCase();
  };
  setIsSidebarVisible = (visible) => {
    this.isSidebarVisible = visible;
  };

  get filteredChats() {
    if (!this.searchQuery) return this.chats;
    return this.chats.filter((c) =>
      c.name.toLowerCase().includes(this.searchQuery)
    );
  }

  fetchMessages = async (chatId) => {
    try {
      const res = await api.get(`/message/${chatId}`);
      runInAction(() => {
        const chat = this.chats.find((c) => c._id === chatId);
        if (chat) chat.messages = res.messages || [];
      });
    } catch (err) {
      console.log(err);
    }
  };

  setSelectedChat = (chat) => {
    this.selectedChat = chat;
    this.isSidebarVisible = false; // Auto-close sidebar on mobile
    if (chat?._id) {
      emitJoinChat(chat._id);
      this.fetchMessages(chat._id);
    }
  };

  fetchChats = async () => {
    if (localStorage.getItem('authorized') === 'true') {
      try {
        const res = await api.get("/chat/all-chats");
        runInAction(() => {
          this.chats = Array.isArray(res.chats)
            ? res.chats.map((c) => ({ ...c, messages: c.messages || [] }))
            : [];
        });
      } catch (err) {
        console.error("Failed to fetch chats:", err);
      }
    }
  }

  sendUserMessage = async (chatId, content) => {
    if (!chatId || !content?.trim()) return;
    this.isBotTyping = true;
    emitSendMessage(chatId, content.trim());
  };
  createChat = async (firstname, lastname) => {
    try {
      const res = await api.post("/chat/create", { firstname, lastname });
      const newChat = res.chat || res;
      if (!newChat?._id) {
        showErrorToast("Failed to create chat");
        return;
      }
      runInAction(() => {
        this.chats = [newChat, ...this.chats];
      });
      this.setSelectedChat(newChat);
      showSuccessToast(`Chat "${newChat.name}" created`);
    } catch (e) {
      showErrorToast(e.response?.data?.error || "Failed to create chat");
    }
  };

  changeChatName = async (chatId, newName) => {
    try {
      await api.patch("/chat/", { chatId, newChatName: newName });
      runInAction(() => {
        const chat = this.chats.find((c) => c._id === chatId);
        if (chat) chat.name = newName;
        if (this.selectedChat?._id === chatId) {
          this.selectedChat = { ...this.selectedChat, name: newName };
        }
      });
      showSuccessToast("Chat renamed");
    } catch (e) {
      console.error("Failed to rename chat:", e);
      showErrorToast(e.response?.data?.error || "Failed to rename chat");
    }
  };

  deleteChat = async (chatId) => {
    try {
      await api.delete(`/chat/${chatId}`);
      runInAction(() => {
        this.chats = this.chats.filter((c) => c._id !== chatId);
        if (this.selectedChat?._id === chatId) this.selectedChat = null;
      });
      showSuccessToast("Chat deleted");
    } catch (e) {
      console.error("Failed to delete chat:", e);
      showErrorToast(e.response?.data?.error || "Failed to delete chat");
    }
  };
}

const chatStore = new ChatStore();
export default chatStore;
