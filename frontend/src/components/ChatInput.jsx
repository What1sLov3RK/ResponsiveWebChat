import React, { forwardRef } from 'react';
import "../css/chatInput.css";
import Input from "./Input";

const ChatInput = forwardRef(({ onChange, value, placeholder, onKeyDown }, ref) => {
    return (
        <div className="input-wrapper">
            <Input
                ref={ref}
                type="text"
                onChange={onChange}
                onKeyDown={onKeyDown}
                value={value}
                placeholder={placeholder}
                className="chat-input"
            />
        </div>
    );
});

export default ChatInput;
