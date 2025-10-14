import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import UserRepository from '../../db/users/UserRepository.js';
import Chat from '../../db/models/Chats.model.js';
import User from '../../db/models/Users.model.js';

class UserService {
  static async createUser(email, password, firstname, lastname) {
    const existing = await UserRepository.findOneByEmail(email);
    if (existing) {
      const error = new Error('User with this email already exists');
      error.status = 409;
      throw error;
    }

    const hashed = await bcrypt.hash(password, 5);
    const user = await UserRepository.createUser(email, hashed, firstname, lastname);
    const tokens = await this.generateTokens(user.id, email);

    user.refresh_token = tokens.refresh_token;
    await user.save();

    const defaultChats = ['Gimmel', 'Aizen', 'Frieren'];
    const chats = await Promise.all(
      defaultChats.map((name) => Chat.create({ name, user: user._id })),
    );
    user.chats.push(...chats.map((c) => c._id));
    await user.save();

    return { ...tokens, user };
  }

  static async login(email, password) {
    const user = await UserRepository.findOneByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      const error = new Error('Invalid email or password');
      error.status = 401;
      throw error;
    }

    const tokens = await this.generateTokens(user.id, email);
    user.refresh_token = tokens.refresh_token;
    await user.save();

    return {
      ...tokens,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
    };
  }

  static async generateTokens(userId, email) {
    const accessSecret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
    const refreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;

    if (!accessSecret || !refreshSecret) {
      const error = new Error('JWT secrets not configured');
      error.status = 500;
      throw error;
    }

    const payload = { userId, email };

    return {
      access_token: jwt.sign(payload, accessSecret, { expiresIn: '15m' }),
      refresh_token: jwt.sign(payload, refreshSecret, { expiresIn: '7d' }),
    };
  }

  static async refreshToken(refreshToken) {
    const refreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
    try {
      const decoded = jwt.verify(refreshToken, refreshSecret);
      const user = await User.findById(decoded.userId);

      if (!user || user.refresh_token !== refreshToken) {
        const error = new Error('Unauthorized');
        error.status = 401;
        throw error;
      }

      const newTokens = await this.generateTokens(user._id, user.email);
      user.refresh_token = newTokens.refresh_token;
      await user.save();

      return newTokens;
    } catch {
      const error = new Error('Unauthorized');
      error.status = 401;
      throw error;
    }
  }
}

export default UserService;
