import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const required = (key, value) => {
  if (!value) throw new Error(`Missing required env variable: ${key}`);
  return value;
};

export const config = {
  port: process.env.PORT || 4000,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  dbUrl: process.env.DB_URL,
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  cookieSecure: process.env.COOKIE_SECURE || true,
  cookieDomain: process.env.COOKIE_DOMAIN,
  node_env: process.env.NODE_ENV,
};
