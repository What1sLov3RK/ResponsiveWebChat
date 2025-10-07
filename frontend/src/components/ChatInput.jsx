import React from 'react';
import "../css/chatInput.css";
import Input from "./Input";

const ChatInput = ({ onChange, value, placeholder, onKeyDown }) => {
    return (
        <div className="input-wrapper">
            <Input
                type="text"
                onChange={onChange}
                onKeyDown={onKeyDown}
                value={value}
                placeholder={placeholder}
                className="chat-input"
            />
        </div>
    );
};

export default ChatInput;
