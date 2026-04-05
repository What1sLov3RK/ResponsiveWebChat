import React, {useState} from 'react';
import Modal from "./Modal";
import Input from "./Input";
import Button from "./Button";
import { showErrorToast } from "../utils/toastHelper";
import chatStore from "../stores/chatStore";

const CreateChatModal = ({ onClose }) => {
    const { createChat } = chatStore;
    const [mode, setMode] = useState('user'); // 'user' or 'bot'
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

    const handleSubmit = async (event) => {
      event.preventDefault();
      if (mode === 'user') {
        if (email.trim()) {
          await createChat(null, null, email.trim(), false);
          onClose();
        } else {
          showErrorToast('Email is required');
        }
      } else {
        if (firstName.trim()) {
          await createChat(firstName.trim(), lastName.trim(), null, true);
          onClose();
        } else {
          showErrorToast('First name is required');
        }
      }
    };

    return (
        <Modal onClose={onClose} name={"Create new chat"}>
            <div className="modal-tabs">
                <button
                    type="button"
                    className={mode === 'user' ? 'active' : ''}
                    onClick={() => setMode('user')}
                >
                    Direct Chat
                </button>
                <button
                    type="button"
                    className={mode === 'bot' ? 'active' : ''}
                    onClick={() => setMode('bot')}
                >
                    Bot Chat
                </button>
            </div>

            <form onSubmit={handleSubmit}>
                {mode === 'user' ? (
                    <div className="input-container">
                        <label>User Email:</label>
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter user email"
                            required
                            autoFocus
                        />
                    </div>
                ) : (
                    <>
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
                                placeholder="Enter last name (optional)"
                            />
                        </div>
                    </>
                )}
                <div className="change-modal-buttons-container">
                    <Button type="submit" name={mode === 'user' ? "Start Chat" : "Create Bot Chat"} />
                </div>
            </form>
        </Modal>
    );
}

export default CreateChatModal;