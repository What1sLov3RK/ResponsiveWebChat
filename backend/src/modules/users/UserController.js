import UserService from './UserService.js';
import { logger } from '../../logger.js';
import { cookieOptions } from '../../utils/cookieOptions.js';

class UserController {
  static async register(req, res) {
    try {
      const { email, password, firstname, lastname } = req.body;
      const { user, access_token, refresh_token } = await UserService.createUser(
        email,
        password,
        firstname,
        lastname,
      );

      res.cookie('access_token', access_token, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000,
      });

      res.cookie('refresh_token', refresh_token, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      logger.info(`✅ User registered: ${email}`);
      return res.status(201).json({ message: 'User registered', user });
    } catch (error) {
      if (error.status === 409 || error.message.includes('exists')) {
        logger.warn(`⚠️ Registration conflict for email: ${req.body.email}`);
        return res.status(409).json({ error: 'User with this email already exists' });
      }

      logger.error({ error: error.message }, '❌ Registration error');
      return res
        .status(error.status || 500)
        .json({ error: error.message || 'Internal Server Error' });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;
      const { user, access_token, refresh_token } = await UserService.login(email, password);

      res.cookie('access_token', access_token, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000,
      });

      res.cookie('refresh_token', refresh_token, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      logger.info(`✅ Login successful for ${email}`);
      return res.status(200).json({ message: 'Login successful', user });
    } catch (error) {
      logger.error({ error: error.message }, '❌ Login error');
      return res
        .status(error.status || 500)
        .json({ error: error.message || 'Internal Server Error' });
    }
  }

  static async refreshToken(req, res) {
    try {
      const refreshToken =
        req.cookies?.refresh_token || req.body?.refresh_token || req.body?.refreshToken;

      const { access_token, refresh_token } = await UserService.refreshToken(refreshToken);

      res.cookie('access_token', access_token, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000,
      });

      res.cookie('refresh_token', refresh_token, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      logger.info('Tokens rotated successfully');
      return res.status(200).json({ message: 'Token rotated successfully' });
    } catch (error) {
      logger.error({ error: error.message }, '❌ Token refresh error');
      return res
        .status(error.status || 500)
        .json({ error: error.message || 'Internal Server Error' });
    }
  }

  static async logout(req, res) {
    try {
      const refreshToken = req.cookies?.refresh_token;
      if (refreshToken) {
        await UserService.logout(refreshToken);
      }

      res.clearCookie('access_token', cookieOptions);
      res.clearCookie('refresh_token', cookieOptions);

      logger.info('👋 User logged out successfully');
      return res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
      logger.error({ error: error.message }, '❌ Logout error');
      return res
        .status(error.status || 500)
        .json({ error: error.message || 'Internal Server Error' });
    }
  }
}

export default UserController;
