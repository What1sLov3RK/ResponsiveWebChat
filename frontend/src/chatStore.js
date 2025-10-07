import { makeAutoObservable, runInAction } from 'mobx';
import api from "./api";
import { toast } from "react-toastify";

class ChatStore {
  chats = [];
  selectedChat = null;
  error = null;
  searchQuery = '';

  constructor() {
    makeAutoObservable(this);
  }

  setChats = async (newChats) => {
    this.chats = newChats;
    await this.fetchChats()
  }


  setSearchQuery = (query) => {
    this.searchQuery = query.toLowerCase();

  }

  get filteredChats() {
    if (!this.searchQuery) {
      return this.chats;
    }
    return this.chats.filter(chat =>
      chat.name.toLowerCase().includes(this.searchQuery)
    );
  }

  addChat = (newChat) => {
    if(newChat ) {
      this.chats.push(newChat);
    }
  }

  setSelectedChat = (chat) => {
    this.selectedChat = chat;
    console.log(this.selectedChat)
  }


fetchChats = async () => {
  const authCheck = localStorage.getItem("authorized");
  if (!authCheck) {
    toast.info("Please log in to see your chats.");
    return;
  }

  this.error = null;

  try {
    const response = await api.get("/chat/all-chats");

    const fetchedChats = Array.isArray(response)
      ? response
      : response.chats || [];

    if (fetchedChats.length === 0) {
      toast.info("No chats found yet.");
    } else {
      toast.success(`Loaded ${fetchedChats.length} chats.`);
    }

    runInAction(() => {
      fetchedChats.forEach((chat) => {
        const exists = this.chats.find((c) => c._id === chat._id);
        if (!exists) this.chats.push(chat);
      });
    });
  } catch (error) {
    console.error("Failed to fetch chats", error);
    const message =
      error.response?.data?.error ||
      error.message ||
      "Failed to fetch chats from server.";
    toast.error(message);
    runInAction(() => {
      this.error = message;
    });
  }
};


  createChat = async (firstname, lastname) => {
  try {
    const payload = { firstname, lastname };
    const response = await api.post("/chat/create", payload);

    const newChat = response.chat || response; // support both forms

    if (!newChat || !newChat._id) {
      toast.error("Server did not return chat data.");
      return;
    }

    runInAction(() => {
      this.addChat(newChat);
    });

    toast.success(`Chat "${newChat.name}" created successfully!`);
  } catch (error) {
    console.error("Failed to create chat", error);
    const message =
      error.response?.data?.error ||
      error.message ||
      "Failed to create chat.";
    toast.error(message);
  }
};


sendUserMessage = async (chatId, messageContent) => {
    try {
      const payload = { chatId, content: messageContent };
      const response = await api.post('/chat/send-message', payload);
      const message = response.message;
      const existingChat = this.chats.find(chat => chat._id === chatId);
      if (existingChat) {
        existingChat.messages.push(message);
      }
    } catch (error) {
      console.error('Failed to send message', error);
      toast.error("Failed to send message.");
    } finally {
      await this.getAutoReply(chatId);
    }
  }

  getAutoReply = async (chatId) => {
    try {
      const payload = { chatId };
      const response = await api.post('/chat/get-reply', payload);
      const message = response.message;
      const existingChat = this.chats.find(chat => chat._id === chatId);
      if (existingChat) {
        existingChat.messages.push(message);
      }
      toast.dark(message.content);
    } catch (error) {
      console.error('Failed to get reply', error);
    }
  }

  changeChatName = async (chatId, newName) => {
      try {
        const payload = { chatId: chatId, newChatName: newName }
        await api.patch('/chat/', payload);
        const chat = this.chats.find(chat => chat._id === chatId);
        if (chat) {
        chat.name = newName;
      }
        toast.success("Chat renamed!");
      } catch (error) {
        console.error('Failed to create chat', error);
        toast.error("Failed to create chat.");
      }
  }

    deleteChat = async (chatId) => {
      try {
         await api.delete(`/chat/${chatId}`);
         this.chats = this.chats.filter(chat => chat._id !== chatId);
        toast.success("Chat deleted!");
      } catch (error) {
        toast.error("Failed to delete chat.");
      }
  }

}

const chatStore = new ChatStore();
export default chatStore;
