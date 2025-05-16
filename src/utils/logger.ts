// No imports needed for silent mode

import { pino } from 'pino';

/**
 * Creates and configures the application logger
 *
 * When the log level is set to 'silent', logging is skipped entirely.
 * For all other log levels, logs will be formatted with pino-pretty and displayed in the console.
 *
 * @param options Additional logger configuration options
 * @param options.name Optional name for the logger instance
 * @param options.level Optional logging level (defaults to process.env.LOG_LEVEL or 'info')
 * @returns Configured Pino logger instance
 */
export function createLogger(options?: { name?: string; level?: string }) {
  const level = options?.level || process.env.LOG_LEVEL || 'info';

  if (level === 'silent') {
    // When level is silent, return a logger that skips logging entirely
    return pino({
      name: options?.name,
      level,
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
