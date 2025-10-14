import React, {useState} from 'react';
import Modal from "./Modal";
import Input from "./Input";
import Button from "./Button";
import {toast} from "react-toastify";
import chatStore from "../stores/chatStore";

const CreateChatModal = ({ onClose }) => {
    const { createChat } = chatStore;
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

    const handleSubmit = async (event) => {
      event.preventDefault();
      if (firstName.length > 0) {
          await createChat(firstName, lastName)
          onClose()
      } else {
        toast.error('No first name');
      }
  };

  return (
        <Modal onClose={onClose} name={"Create new chat"}>
            <form onSubmit={handleSubmit} id="form">
                <div className="modal-input-container">
                    <label>First name:</label>
                    <Input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Enter first name"
                    />
                </div>
                <div className="modal-input-container">
                    <label>Last name:</label>
                    <Input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Enter last name"
                    />
                </div>
                <div className="change-modal-buttons-container">
                    <Button type="submit" name="Create Chat" className="margin-right-10px"></Button>
                </div>
            </form>
        </Modal>
  );
}

export default CreateChatModal;