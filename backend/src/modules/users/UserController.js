import UserService from './UserService.js';
import { logger } from '../../logger.js';

class UserController {
  static async register(req, res) {
    try {
      const { email, password, firstname, lastname } = req.body;
      const result = await UserService.createUser(email, password, firstname, lastname);
      logger.info('New user created:\nid: ' + result.user.id + '\nemail:' + email);
      return res.status(201).json(result);
    } catch (error) {
      logger.error({ error: error.message }, 'Registration error');
      return res
        .status(error.status || 500)
        .json({ error: error.message || 'Internal Server Error' });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await UserService.login(email, password);
      logger.info('User logged in:' + result.email);
      return res.status(200).json(result);
    } catch (error) {
      logger.error({ error: error.message }, 'Login error');
      return res
        .status(error.status || 500)
        .json({ error: error.message || 'Internal Server Error' });
    }
  }

  static async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      const result = await UserService.refreshToken(refreshToken);
      return res.status(200).json(result);
    } catch (error) {
      logger.error({ error: error.message }, 'Token refresh error');
      return res
        .status(error.status || 500)
        .json({ error: error.message || 'Internal Server Error' });
    }
  }
}

export default UserController;
