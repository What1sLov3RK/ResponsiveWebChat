import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstname: { type: String },
  lastname: { type: String },
  refresh_token: { type: String, default: "" },
  chats: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chat", default: [] }],
});

export default mongoose.model("User", UserSchema);
