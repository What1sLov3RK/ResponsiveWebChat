import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import ChatRouter from '../src/modules/chats/ChatRouter.js';
import MessageRouter from '../src/modules/message/MessageRouter.js';
import UserRouter from '../src/modules/users/UserRouter.js';
import Chat from '../src/db/models/Chats.model.js';
import Message from '../src/db/models/Messages.model.js';
import User from '../src/db/models/Users.model.js';
import { connectTestDB, clearTestDB, disconnectTestDB } from './testSetupDB.js';

// Setup app
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/chat', ChatRouter);
app.use('/api/message', MessageRouter);
app.use('/api/users', UserRouter);

// Skip actual auth in middleware for simplicity in integration test
// Or use actual auth and login. Let's use actual auth to be sure.

beforeAll(async () => await connectTestDB());
afterEach(async () => await clearTestDB());
afterAll(async () => await disconnectTestDB());

describe('💬 Chat and Message Persistence', () => {
  it('should create a chat and persist it in DB', async () => {
    // 1. Create User
    const userRes = await request(app).post('/api/users/registration').send({
      email: 'test@example.com',
      password: 'password123',
      firstname: 'Test',
      lastname: 'User'
    });
    
    expect(userRes.statusCode).toBe(201);
    const cookies = userRes.get('Set-Cookie');
    expect(cookies).toBeDefined();

    // 2. Create Chat
    const chatRes = await request(app)
      .post('/api/chat/create')
      .set('Cookie', cookies)
      .send({ firstname: 'Bot', lastname: 'Chat', isBot: true });

    expect(chatRes.statusCode).toBe(201);
    const chatId = chatRes.body.chat._id;

    // 3. Verify in DB
    const chat = await Chat.findById(chatId);
    expect(chat).not.toBeNull();
    expect(chat.name).toBe('Bot Chat');
    expect(chat.isBot).toBe(true);
    expect(chat.participants).toHaveLength(1);
    expect(chat.participants[0].toString()).toBe(userRes.body.user._id);
  });

  it('should store messages and retrieve them', async () => {
    // 1. Create User & Chat
    const userRes = await request(app).post('/api/users/registration').send({
      email: 'msg@example.com',
      password: 'password123',
      firstname: 'Msg',
      lastname: 'User'
    });
    
    expect(userRes.statusCode).toBe(201);
    const cookies = userRes.get('Set-Cookie');

    const chatRes = await request(app)
      .post('/api/chat/create')
      .set('Cookie', cookies)
      .send({ firstname: 'Bot', lastname: 'Chat', isBot: true });
    const chatId = chatRes.body.chat._id;

    // 2. Send Message
    const msgRes = await request(app)
      .post('/api/message/send')
      .set('Cookie', cookies)
      .send({ chatId, content: 'Hello DB!' });

    expect(msgRes.statusCode).toBe(200);

    // 3. Verify Message in DB
    const messages = await Message.find({ chatId });
    expect(messages).toHaveLength(1);
    expect(messages[0].content).toBe('Hello DB!');
    expect(messages[0].sender).toBe('user');
    expect(messages[0].senderId.toString()).toBe(userRes.body.user._id);

    // 4. Retrieve via API
    const retrieveRes = await request(app)
      .get(`/api/message/${chatId}`)
      .set('Cookie', cookies);
    
    expect(retrieveRes.statusCode).toBe(200);
    expect(retrieveRes.body.messages).toHaveLength(1);
    expect(retrieveRes.body.messages[0].content).toBe('Hello DB!');
  });
});
