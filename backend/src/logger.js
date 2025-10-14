import pino from 'pino';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logFilePath = path.join(logDir, 'app.log');
const errorFilePath = path.join(logDir, 'error.log');

const logFileStream = fs.createWriteStream(logFilePath, { flags: 'a' });
const errorFileStream = fs.createWriteStream(errorFilePath, { flags: 'a' });

const logger = pino(
  {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
      level(label) {
        return { level: label };
      },
    },
  },
  pino.multistream([
    { stream: process.stdout },
    { stream: logFileStream },
    { level: 'error', stream: errorFileStream },
  ]),
);

export { logger };
