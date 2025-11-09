import User from '../src/db/models/Users.model.js';
import { connectTestDB, clearTestDB, disconnectTestDB } from './testSetupDB.js';

beforeAll(async () => await connectTestDB());
afterEach(async () => await clearTestDB());
afterAll(async () => await disconnectTestDB());

describe('User Model (in-memory MongoDB)', () => {
  it('should create a new user', async () => {
    const user = new User({
      email: 'vlad@example.com',
      password: 'securepass',
      firstname: 'Vlad',
      lastname: 'Romanov',
    });
    const savedUser = await user.save();

    expect(savedUser._id).toBeDefined();
    expect(savedUser.email).toBe('vlad@example.com');
    expect(savedUser.chats).toEqual([]);
  });

  it('should require email and password', async () => {
    try {
      const user = new User({});
      await user.save();
    } catch (err) {
      expect(err.errors.email).toBeDefined();
      expect(err.errors.password).toBeDefined();
    }
  });

  it('should enforce unique email', async () => {
    const user1 = new User({
      email: 'vlad@example.com',
      password: '12345678',
    });
    const user2 = new User({
      email: 'vlad@example.com',
      password: 'abcdefg',
    });

    await user1.save();
    await expect(user2.save()).rejects.toThrow();
  });

  it('should allow linking chats', async () => {
    const fakeChatId = new User()._id; // just simulate ObjectId
    const user = new User({
      email: 'link@example.com',
      password: '12345678',
      chats: [fakeChatId],
    });
    const savedUser = await user.save();
    expect(savedUser.chats.length).toBe(1);
  });
});
