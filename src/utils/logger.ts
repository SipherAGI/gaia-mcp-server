import pino from 'pino';

/**
 * Creates and configures the application logger
 * 
 * @param options Additional logger configuration options
 * @returns Configured Pino logger instance
 */
export function createLogger(options?: {
  name?: string;
  level?: string;
}) {
  return pino({
    name: options?.name,
    level: options?.level || process.env.LOG_LEVEL || 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    }
  });
}

// Default logger instance
export const logger = createLogger({ name: 'gaia-mcp' }); 