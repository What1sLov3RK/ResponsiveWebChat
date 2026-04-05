import React, { forwardRef, useEffect, useRef } from 'react';
import "../css/chatInput.css";
import Input from "./Input";
import { emitTypingStart, emitTypingStop } from "../sockets/emitters";

const ChatInput = forwardRef(({ onChange, value, placeholder, onKeyDown, chatId }, ref) => {
    const isTypingRef = useRef(false);
    const typingTimeoutRef = useRef(null);

    useEffect(() => {
        if (!chatId) return;

        if (value && !isTypingRef.current) {
            isTypingRef.current = true;
            emitTypingStart(chatId);
        }

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        typingTimeoutRef.current = setTimeout(() => {
            if (isTypingRef.current) {
                isTypingRef.current = false;
                emitTypingStop(chatId);
            }
        }, 2000);

        return () => {
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            if (isTypingRef.current) emitTypingStop(chatId);
        };
    }, [value, chatId]);

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
