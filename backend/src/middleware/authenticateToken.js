import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { logger } from '../logger.js';

const authMiddleware = (req, res, next) => {
  try {
    const cookieToken = req.cookies?.access_token;
    const headerToken = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : null;

    const token = cookieToken || headerToken;

    if (!token) {
      return res.status(401).json({ error: 'Missing access token' });
    }

    const decoded = jwt.verify(token, config.jwtAccessSecret);

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    next();
  } catch (err) {
    logger.error('Auth verification failed:', err.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export default authMiddleware;
