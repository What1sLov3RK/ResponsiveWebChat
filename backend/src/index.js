import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import UserRouter from "./users/UserRouter.js";
import ChatRouter from "./chats/ChatRouter.js";

dotenv.config();

const DB_URI = process.env.DB_URL;
const PORT = process.env.PORT || 4000;

const app = express();

app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());

// API routes
app.use("/api/users", UserRouter);
app.use("/api/chat", ChatRouter);

// Serve frontend
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendPath = path.resolve(__dirname, "../frontend/build");

app.use(express.static(frontendPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// Start server
async function startApp() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(DB_URI);
    console.log("Connected to MongoDB ✅");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (e) {
    console.error("Failed to start server:", e);
  }
}

startApp();
