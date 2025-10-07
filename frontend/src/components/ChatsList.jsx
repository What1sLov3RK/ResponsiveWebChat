import React, {useState} from "react";
import { observer } from 'mobx-react-lite';
import chatStore from '../chatStore';
import Button from "./Button";
import CreateChatModal from "./CreateChatModal";
import "../css/chats.css"

const ChatsList = observer(() => {
    const { filteredChats, fetchChats, setSelectedChat, selectedChat } = chatStore;
    const chats = filteredChats
    const [isModalOpen, setIsModalOpen] = useState(false);
    const reversedChats = [...chats].reverse()
    const openModal = () =>{
        setIsModalOpen(true)
    }

    const closeModal = () =>{
        setIsModalOpen(false)
    }

    React.useEffect(() => {
        fetchChats();
    }, [fetchChats]);

    const handleChatClick = (chat) => {
        setSelectedChat(chat);
    };

    const formatDate = (timestamp) => {
        return new Date(timestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
    };

    return (
        <div id={'chats-container'}>
            <div className={'chats-head'}>
                <span>Chats</span>
                <Button name={'+'} onClick={openModal}/>
                {isModalOpen && (<CreateChatModal onClose={closeModal}/>)}
            </div>
            <div className="chat-list">
                { chats.length > 0 ? (
                    reversedChats.map((chat) => (
                        <div
                            key={chat._id}
                            onClick={() => handleChatClick(chat)}
                            className={`chat-item ${selectedChat && selectedChat._id === chat._id ? 'active' : ''}`}
                        >
                            <img className={"chat-logo"} src={"https://randomuser.me/api/portraits/lego/5.jpg"} alt={"te"}/>
                            <div className={"chat-name-message"}>
                                <span className='chat-name'>
                                {chat.name}
                                </span>
                                <br/>
                                <div className={'recent-message-container'}>
                                    <p className="truncate-text">{chat.messages[0] ? String(chat.messages[chat.messages.length - 1].content): ''}</p>
                                    <span className='recent-message-timestamp'>{chat.messages[0] ? formatDate(chat.messages[chat.messages.length - 1].timestamp):''}</span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                   <></>
                )}
            </div>
        </div>
    );
});

export default ChatsList;
