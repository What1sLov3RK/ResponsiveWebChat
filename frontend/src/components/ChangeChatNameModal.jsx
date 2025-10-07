import React, { useState } from "react";
import Modal from "./Modal";
import Input from "./Input";
import Button from "./Button";
import { toast } from "react-toastify";
import chatStore from "../chatStore";
import "../css/form.css"; // ✅ make sure this is included

const ChangeChatNameModal = ({ onClose }) => {
  const { changeChatName, selectedChat, deleteChat, setSelectedChat } =
    chatStore;
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const handleDeleteChat = async (event) => {
    event.preventDefault();
    await deleteChat(selectedChat._id);
    setSelectedChat(null);
    onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!firstName.trim()) {
      toast.error("Please enter a name");
      return;
    }

    const newName = `${firstName.trim()} ${lastName.trim()}`.trim();
    await changeChatName(selectedChat._id, newName);
    onClose();
  };

  return (
    <Modal onClose={onClose} name="Rename Chat">
      <form onSubmit={handleSubmit} id="form">
        <div className="input-container">
          <label>First name:</label>
          <Input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Enter first name"
            required
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
            className="margin-right-10px"
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
