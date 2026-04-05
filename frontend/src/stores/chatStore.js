import { makeAutoObservable, runInAction } from "mobx";
import api from "../api";
import { showErrorToast, showSuccessToast, showInfoToast } from "../utils/toastHelper";
import { connectSocket, disconnectSocket, socket } from "../sockets/socket";
import { registerMessageHandlers, unregisterMessageHandlers } from "../sockets/handlers/messageHandlers";
import { emitJoinChat, emitSendMessage } from "../sockets/emitters";

class ChatStore {
  chats = [];
  currentUser = null;
  selectedChat = null;
  searchQuery = "";
  error = null;
  typingStatus = {}; // chatId -> [userIds]
  isBotTyping = false;
  isSidebarVisible = false;
  onlineUsers = {}; // userId -> boolean
  _socketInitialized = false;

  constructor() {
    makeAutoObservable(this);
    this.syncUser();
  }

  syncUser = () => {
    const storedUser = localStorage.getItem('user-info');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        runInAction(() => {
          this.currentUser = user;
        });
      } catch (e) {
        console.error('Failed to parse user info', e);
      }
    }
  }

  setCurrentUser = (user) => {
    runInAction(() => {
      this.currentUser = user;
    });
  }

  initSocket = () => {
    if (localStorage.getItem('authorized') === 'true') {
      if (this._socketInitialized) return;

      socket.on("connect", () => console.log("⚡️ Socket connected:", socket.id));
      connectSocket().catch((err) => {
        console.error("Failed to connect socket:", err);
      });
      registerMessageHandlers({
        onMessageReceived: this.handleIncomingMessage,
        onTyping: this.handleTypingStatus,
        onUserOnline: this.handleUserOnline,
        onUserOffline: this.handleUserOffline,
        onChatCreated: this.handleChatCreated,
        onChatDeleted: this.handleChatDeleted
      });

      this._socketInitialized = true;
    }
  }

  handleUserOnline = (data) => {
    runInAction(() => {
      if (data.userId) {
        this.onlineUsers = { ...this.onlineUsers, [data.userId]: true };
      } else if (data.userIds) {
        const newOnline = { ...this.onlineUsers };
        data.userIds.forEach(id => {
          newOnline[id] = true;
        });
        this.onlineUsers = newOnline;
      }
    });
  };

  handleUserOffline = (userId) => {
    runInAction(() => {
      const newOnline = { ...this.onlineUsers };
      delete newOnline[userId];
      this.onlineUsers = newOnline;
    });
  };

  handleChatCreated = (chat) => {
    runInAction(() => {
      if (!this.chats.find(c => c._id === chat._id)) {
        this.chats = [{ ...chat, messages: chat.messages || [] }, ...this.chats];
        // Only show toast if it's not the creator (creator already got success toast from API)
        const isCreator = String(chat.participants[0]?._id || chat.participants[0]) === String(this.currentUser?._id);
        if (!isCreator) {
          showInfoToast(`New chat with ${chat.participants.find(p => (p._id || p) !== this.currentUser?._id)?.firstname || 'someone'} created`);
        }
      } else {
        // If chat already exists, update its details just in case
        const index = this.chats.findIndex(c => c._id === chat._id);
        if (index !== -1) {
          this.chats[index] = { ...this.chats[index], ...chat };
        }
      }
    });
  };
  
  handleChatDeleted = (chatId) => {
    runInAction(() => {
      this.chats = this.chats.filter(c => c._id !== chatId);
      if (this.selectedChat && this.selectedChat._id === chatId) {
        this.selectedChat = null;
        showInfoToast("This chat has been deleted");
      }
    });
  };

  uploadProfileImage = async (file) => {
    const formData = new FormData();
    formData.append('profileImage', file);
    try {
      const response = await api.post('/users/profile-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      runInAction(() => {
        this.currentUser = response.user;
        localStorage.setItem('user-info', JSON.stringify(response.user));
      });
    } catch (e) {
      showErrorToast('Failed to upload profile image');
    }
  };

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
          updatedAt: message.createdAt || new Date().toISOString(),
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
        } else {
          // Clear typing status when message is received
          this.handleTypingStatus(message.chatId, message.senderId, false);
        }
      } else {
        console.warn(" Received message for unknown chat:", message.chatId);
      }
    });
  };

  handleTypingStatus = (chatId, userId, isTyping) => {
    runInAction(() => {
      const currentChatTyping = [...(this.typingStatus[chatId] || [])];
      
      if (isTyping) {
        if (!currentChatTyping.some(id => String(id) === String(userId))) {
          currentChatTyping.push(userId);
        }
      } else {
        const filtered = currentChatTyping.filter(id => String(id) !== String(userId));
        if (filtered.length === currentChatTyping.length) return; // No change
        this.typingStatus = { ...this.typingStatus, [chatId]: filtered };
        return;
      }
      
      this.typingStatus = { ...this.typingStatus, [chatId]: currentChatTyping };
    });
  };

  setSearchQuery = (q) => {
    this.searchQuery = q.toLowerCase();
  };
  setIsSidebarVisible = (visible) => {
    this.isSidebarVisible = visible;
  };

  get sortedChats() {
    const chats = this.searchQuery
      ? this.chats.filter((c) =>
          c.name.toLowerCase().includes(this.searchQuery)
        )
      : this.chats;
    return [...chats].sort(
      (a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)
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
      if (!this.currentUser || !this.currentUser._id) {
        await this.fetchMe();
      }
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

  fetchMe = async () => {
    if (localStorage.getItem('authorized') === 'true') {
      try {
        const res = await api.get("/users/me");
        runInAction(() => {
          this.currentUser = res.user;
        });
      } catch (err) {
        console.error("Failed to fetch current user:", err);
      }
    }
  };

  sendUserMessage = async (chatId, content) => {
    if (!chatId || !content?.trim()) return;
    const chat = this.chats.find((c) => c._id === chatId);
    if (chat?.isBot) {
      this.isBotTyping = true;
    }
    emitSendMessage(chatId, content.trim());
  };
  createChat = async (firstname, lastname, email, isBot = true) => {
    try {
      const payload = email ? { email } : { firstname, lastname, isBot };
      const res = await api.post("/chat/create", payload);
      const newChat = res.chat || res;
      if (!newChat?._id) {
        showErrorToast("Failed to create chat");
        return;
      }
      runInAction(() => {
        if (!this.chats.find(c => c._id === newChat._id)) {
          this.chats = [{ ...newChat, messages: newChat.messages || [] }, ...this.chats];
        }
      });
      this.setSelectedChat(newChat);
      showSuccessToast(email ? `Chat with ${email} created` : `Chat "${newChat.name}" created`);
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
