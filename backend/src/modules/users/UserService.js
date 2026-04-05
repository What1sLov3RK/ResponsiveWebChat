import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import UserRepository from '../../db/users/UserRepository.js';
import Chat from '../../db/models/Chats.model.js';
import User from '../../db/models/Users.model.js';
import { logger } from '../../logger.js';
import { config } from '../../config/index.js';

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

    const tokens = await this.generateTokens({
      userId: user._id,
      email: user.email,
    });

    user.refresh_token = tokens.refresh_token;
    await user.save();

    const defaultChats = ['Gimmel', 'Aizen', 'Frieren'];
    const botAvatars = [
      'https://randomuser.me/api/portraits/lego/1.jpg',
      'https://randomuser.me/api/portraits/lego/2.jpg',
      'https://randomuser.me/api/portraits/lego/3.jpg',
      'https://randomuser.me/api/portraits/lego/4.jpg',
      'https://randomuser.me/api/portraits/lego/5.jpg',
      'https://randomuser.me/api/portraits/lego/6.jpg',
      'https://randomuser.me/api/portraits/lego/7.jpg',
      'https://randomuser.me/api/portraits/lego/8.jpg',
    ];
    await Promise.all(
      defaultChats.map((name) =>
        Chat.create({
          name,
          participants: [user._id],
          isBot: true,
          avatar: botAvatars[Math.floor(Math.random() * botAvatars.length)],
        }),
      ),
    );

    return { ...tokens, user };
  }

  static async getUserById(userId) {
    return User.findById(userId).select('-password -refresh_token').lean();
  }

  static async login(email, password) {
    const user = await UserRepository.findOneByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      const error = new Error('Invalid email or password');
      error.status = 401;
      throw error;
    }

    const tokens = await this.generateTokens({
      userId: user._id,
      email: user.email,
    });

    user.refresh_token = tokens.refresh_token;
    await user.save();

    return { ...tokens, user };
  }

  static async generateTokens(payload) {
    const accessSecret = config.jwtAccessSecret;
    const refreshSecret = config.jwtRefreshSecret;

    if (!accessSecret || !refreshSecret) {
      const error = new Error('JWT secrets not configured');
      error.status = 500;
      throw error;
    }

    return {
      access_token: jwt.sign(payload, accessSecret, { expiresIn: '15m' }),
      refresh_token: jwt.sign(payload, refreshSecret, { expiresIn: '7d' }),
    };
  }

  static async refreshToken(oldRefreshToken) {
    const refreshSecret = config.jwtRefreshSecret;

    if (!oldRefreshToken) {
      const error = new Error('Unauthorized: no refresh token provided');
      error.status = 401;
      throw error;
    }

    try {
      const decoded = jwt.verify(oldRefreshToken, refreshSecret);
      const user = await User.findById(decoded.userId);

      if (!user) {
        const error = new Error('User not found');
        error.status = 404;
        throw error;
      }

      if (user.refresh_token !== oldRefreshToken) {
        const error = new Error('Invalid or expired refresh token');
        error.status = 401;
        throw error;
      }

      const newTokens = await this.generateTokens({
        userId: user._id,
        email: user.email,
      });

      user.refresh_token = newTokens.refresh_token;
      await user.save();

      logger.info(`🔁 Token rotated for user ${user.email}`);
      return newTokens;
    } catch (err) {
      logger.error({ error: err }, 'Token rotation error');
      const error = new Error('Unauthorized or invalid token');
      error.status = 401;
      throw error;
    }
  }

  static async logout(refreshToken) {
    const user = await User.findOne({ refresh_token: refreshToken });
    if (user) {
      user.refresh_token = null;
      await user.save();
    }
  }

  static async updateProfileImage(userId, profileImage) {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }
    user.profileImage = profileImage;
    await user.save();
    return user;
  }
}

export default UserService;
