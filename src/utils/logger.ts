import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

import { pino } from 'pino';

/**
 * Creates and configures the application logger
 *
 * When the log level is set to 'silent', logs will be written to a file in the 'logs' directory
 * instead of being displayed in the console. For all other log levels, logs will be formatted
 * with pino-pretty and displayed in the console.
 *
 * @param options Additional logger configuration options
 * @param options.name Optional name for the logger instance (used as the log filename when level is 'silent')
 * @param options.level Optional logging level (defaults to process.env.LOG_LEVEL or 'info')
 * @returns Configured Pino logger instance
 */
export function createLogger(options?: { name?: string; level?: string }) {
  const level = options?.level || process.env.LOG_LEVEL || 'info';

  if (level === 'silent') {
    // Get the absolute path to the server directory using import.meta.url (ES modules)
    const currentFilePath = fileURLToPath(import.meta.url);
    const currentDir = path.dirname(currentFilePath);
    const serverDir = path.resolve(currentDir, '..', '..');

    // Create log directory if it doesn't exist
    const logDir = path.join(serverDir, 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const transport = {
      target: 'pino/file',
      options: {
        destination: path.join(logDir, `${options?.name || 'app'}.log`),
        mkdir: true,
      },
    };

    return pino({
      name: options?.name,
      level,
      transport,
    });
  } else {
    const transport = {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    };

    return pino({
      name: options?.name,
      level,
      transport,
    });
  }
}
