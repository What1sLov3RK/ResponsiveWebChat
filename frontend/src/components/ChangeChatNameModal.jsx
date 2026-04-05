import React, { useState } from "react";
import Modal from "./Modal";
import Input from "./Input";
import Button from "./Button";
import { showErrorToast } from "../utils/toastHelper";
import chatStore from "../stores/chatStore";

const ChangeChatNameModal = ({ onClose }) => {
  const { changeChatName, selectedChat, deleteChat, setSelectedChat } =
    chatStore;

  const [firstName, setFirstName] = useState(
    selectedChat?.firstname || ""
  );
  const [lastName, setLastName] = useState(
    selectedChat?.lastname || ""
  );

  const handleDeleteChat = async (event) => {
    event.preventDefault();
    if (window.confirm("Are you sure you want to delete this chat?")) {
      await deleteChat(selectedChat._id);
      setSelectedChat(null);
      onClose();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!firstName.trim()) {
      showErrorToast("Please enter a name");
      return;
    }

    const newName = `${firstName.trim()} ${lastName.trim()}`.trim();
    await changeChatName(selectedChat._id, newName);
    onClose();
  };

  return (
    <Modal onClose={onClose} name="Rename Chat">
      <form onSubmit={handleSubmit}>
        <div className="input-container">
          <label>First name:</label>
          <Input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Enter first name"
            required
            autoFocus
          />
        </div>

        <div className="input-container">
          <label>Last name:</label>
          <Input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Enter last name"
          />
        </div>

        <div className="change-modal-buttons-container">
          <Button
            type="submit"
            name="Rename Chat"
          />
          <Button
            onClick={handleDeleteChat}
            name="Delete Chat"
            className="danger-button"
          />
        </div>
      </form>
    </Modal>
  );
};

export default ChangeChatNameModal;
