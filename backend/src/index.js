import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import UserRouter from "./users/UserRouter.js";
import ChatRouter from "./chats/ChatRouter.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());

app.use("/api/users", UserRouter);
app.use("/api/chat", ChatRouter);

async function startApp() {
  try {
    await mongoose.connect(process.env.DB_URL);
    app.listen(PORT, () => console.log("✅ Server running on " + PORT));
  } catch (e) {
    console.error("❌ Failed to start server:", e);
  }
}

startApp();
