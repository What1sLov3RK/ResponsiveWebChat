import api from '../api';

export const getChatAvatar = (chat, currentUser) => {
  if (!chat) return "https://randomuser.me/api/portraits/lego/5.jpg";
  if (chat.isBot) {
    return chat.avatar || "https://randomuser.me/api/portraits/lego/5.jpg";
  }
  const myId = String(currentUser?._id || currentUser?.id || "");
  const other = chat.participants?.find((p) => String(p._id || p) !== myId);
  if (other && other.profileImage) {
    return `${api.defaults.baseURL.replace('/api', '')}${other.profileImage}`;
  }
  return "https://randomuser.me/api/portraits/lego/5.jpg";
};

export const getOtherParticipant = (chat, currentUser) => {
  if (!chat || chat.isBot || !chat.participants) return null;
  const myId = String(currentUser?._id || currentUser?.id || "");
  if (!myId) return null;
  return chat.participants.find((p) => String(p._id || p) !== myId);
};

export const getUserAvatar = (user) => {
  if (!user) return "https://randomuser.me/api/portraits/lego/5.jpg";
  if (user.profileImage) {
    return `${api.defaults.baseURL.replace('/api', '')}${user.profileImage}`;
  }
  return "https://randomuser.me/api/portraits/lego/5.jpg";
};
