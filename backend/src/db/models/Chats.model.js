import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema({
  name: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  messages: { type: [mongoose.Schema.Types.ObjectId], ref: "Message", default: [] },
});

export default mongoose.model("Chat", ChatSchema);
