import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import UserRouter from './users/UserRouter.js';
import ChatRouter from './chats/ChatRouter.js';

dotenv.config();

const DB_URI = process.env.DB_URL;
const PORT = process.env.PORT || 4000;

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use('/api/users', UserRouter);
app.use('/api/chat', ChatRouter);

async function startApp() {
  try {
    await mongoose.connect(DB_URI);
    await app.listen(PORT, () => {
      console.log('Server is running on port ' + PORT);
    });
  } catch (e) {
    console.error('Failed to start server:', e);
  }
}

await startApp();
