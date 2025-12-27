import { config } from '../config/index.js';

export const cookieOptions = {
  httpOnly: true,
  secure: config.cookieSecure,
  sameSite: config.sameSite,
  path: '/',
  domain: config.cookieDomain,
};
