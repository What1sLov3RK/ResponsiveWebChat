import UserService from './UserService.js';
import { logger } from '../../logger.js';
import { setAuthCookies, clearAuthCookies } from '../../utils/cookieHelper.js';

class UserController {
  static async register(req, res) {
    const { email, password, firstname, lastname } = req.body;
    if (!email || !password || !firstname || !lastname) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const { user, access_token, refresh_token } = await UserService.createUser(
      email,
      password,
      firstname,
      lastname,
    );

    setAuthCookies(res, access_token, refresh_token);

    logger.info(`✅ User registered: ${email}`);
    return res.status(201).json({ message: 'User registered', user });
  }

  static async login(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const { user, access_token, refresh_token } = await UserService.login(email, password);

    setAuthCookies(res, access_token, refresh_token);

    logger.info(`✅ Login successful for ${email}`);
    return res.status(200).json({ message: 'Login successful', user });
  }

  static async getMe(req, res) {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: missing userId' });
    }
    const user = await UserService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.status(200).json({ user });
  }

  static async refreshToken(req, res) {
    const refreshToken =
      req.cookies?.refresh_token || req.body?.refresh_token || req.body?.refreshToken;

    const { access_token, refresh_token: newRefreshToken } = await UserService.refreshToken(
      refreshToken,
    );

    setAuthCookies(res, access_token, newRefreshToken);

    logger.info('Tokens rotated successfully');
    return res.status(200).json({ message: 'Token rotated successfully' });
  }

  static async logout(req, res) {
    const refreshToken = req.cookies?.refresh_token;
    if (refreshToken) {
      await UserService.logout(refreshToken);
    }

    clearAuthCookies(res);

    logger.info('👋 User logged out successfully');
    return res.status(200).json({ message: 'Logged out successfully' });
  }

  static async uploadProfileImage(req, res) {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const profileImageUrl = `/uploads/profiles/${req.file.filename}`;
    const user = await UserService.updateProfileImage(userId, profileImageUrl);
    return res.status(200).json({ message: 'Profile image updated', user });
  }
}

export default UserController;
