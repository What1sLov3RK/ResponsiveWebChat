import { config } from '../config/index.js';

export const cookieOptions = {
  httpOnly: true,
  secure: config.cookieSecure,
  sameSite: config.cookieSecure ? 'strict' : 'lax',
  path: '/',
  domain: config.cookieDomain,
};
