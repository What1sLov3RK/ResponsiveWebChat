import { makeAutoObservable, runInAction } from "mobx";
import api from "../api";
import { toast } from "react-toastify";
import { connectSocket, disconnectSocket, socket } from "../sockets/socket";
import { registerMessageHandlers, unregisterMessageHandlers } from "../sockets/handlers/messageHandlers";
import { emitJoinChat, emitSendMessage } from "../sockets/emitters";

class ChatStore {
  chats = [];
  selectedChat = null;
  searchQuery = "";
  error = null;
  _socketInitialized = false;

  constructor() {
    makeAutoObservable(this);
  }

  initSocket = () => {
    if (this._socketInitialized) return;

    socket.on("connect", () => console.log("⚡️ Socket connected:", socket.id));
    connectSocket();
    registerMessageHandlers(this.handleIncomingMessage);

    this._socketInitialized = true;
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
        };
        this.chats[chatIndex] = updatedChat;

        if (this.selectedChat && this.selectedChat._id === message.chatId) {
          this.selectedChat = updatedChat;
        }

        if (message.sender === "bot") {
          toast.info(message.content, { autoClose: 1500 });
        }
      } else {
        console.warn(" Received message for unknown chat:", message.chatId);
      }
    });
  };

  setSearchQuery = (q) => {
    this.searchQuery = q.toLowerCase();
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
    if (chat?._id) {
      emitJoinChat(chat._id);
      this.fetchMessages(chat._id);
    }
  };

  fetchChats = async () => {
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
  };

  sendUserMessage = async (chatId, content) => {
    if (!chatId || !content?.trim()) return;
    emitSendMessage(chatId, content.trim());
  };

  createChat = async (firstname, lastname) => {
    try {
      const res = await api.post("/chat/create", { firstname, lastname });
      const newChat = res.chat || res;
      if (!newChat?._id) {
        toast.error("Failed to create chat");
        return;
      }
      runInAction(() => {
        this.chats = [newChat, ...this.chats];
        this.selectedChat = newChat;
      });
      emitJoinChat(newChat._id);
      toast.success(`Chat "${newChat.name}" created`);
    } catch (e) {
      toast.error(e.response?.data?.error || "Failed to create chat");
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
      toast.success("Chat renamed");
    } catch (e) {
      console.error("Failed to rename chat:", e);
      toast.error(e.response?.data?.error || "Failed to rename chat");
    }
  };

  deleteChat = async (chatId) => {
    try {
      await api.delete(`/chat/${chatId}`);
      runInAction(() => {
        this.chats = this.chats.filter((c) => c._id !== chatId);
        if (this.selectedChat?._id === chatId) this.selectedChat = null;
      });
      toast.success("Chat deleted");
    } catch (e) {
      console.error("Failed to delete chat:", e);
      toast.error(e.response?.data?.error || "Failed to delete chat");
    }
  };
}

const chatStore = new ChatStore();
export default chatStore;
