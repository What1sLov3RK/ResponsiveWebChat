import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import userRoutes from '../src/modules/users/UserRouter.js';
import User from '../src/db/models/Users.model.js';
import { connectTestDB, clearTestDB, disconnectTestDB } from './testSetupDB.js';

// Build express app manually for testing
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/auth', userRoutes);

beforeAll(async () => await connectTestDB());
afterEach(async () => await clearTestDB());
afterAll(async () => await disconnectTestDB());

describe('🧩 Auth Integration Tests (in-memory DB)', () => {
  it('should register user and save to DB', async () => {
    const res = await request(app)
      .post('/auth/registration')
      .send({
        email: 'vlad@example.com',
        password: 'password123',
        firstname: 'Vlad',
        lastname: 'Romanov',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toMatch(/User registered/i);

    const user = await User.findOne({ email: 'vlad@example.com' });
    expect(user).not.toBeNull();
    expect(user.firstname).toBe('Vlad');
  });

  it('should log in existing user and set cookies', async () => {
    await request(app).post('/auth/registration').send({
      email: 'vlad@example.com',
      password: 'password123',
      firstname: 'Vlad',
      lastname: 'Romanov',
    });

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'vlad@example.com', password: 'password123' });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/login successful/i);
    expect(res.headers['set-cookie']).toBeDefined();
  });
});
