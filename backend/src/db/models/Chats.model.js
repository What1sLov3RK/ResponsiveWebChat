import mongoose from 'mongoose';

const ChatSchema = new mongoose.Schema({
  name: { type: String, required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isBot: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Chat', ChatSchema);
