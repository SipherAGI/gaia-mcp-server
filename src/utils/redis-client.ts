import { Redis } from 'ioredis';
import { Logger, pino } from 'pino';

export type RedisClientConfig = {
  url: string;
  keyPrefix?: string;
  logger?: Logger;
};

export class RedisClient {
  private readonly keyPrefix: string;
  private readonly logger: Logger;
  private client: Redis | null = null;

  constructor(config: RedisClientConfig) {
    this.keyPrefix = config.keyPrefix || 'gaia-mcp:';
    this.logger =
      config.logger ||
      pino({
        level: process.env.LOG_LEVEL || 'info',
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
          },
        },
      });

    if (config.url) {
      this.initRedis(config.url);
    } else {
      this.logger.info('Redis not configured, using in-memory session storage');
    }
  }

  private initRedis(redisUrl: string): void {
    try {
      // Check if URL is a valid Redis URL format
      if (!redisUrl.startsWith('redis://') && !redisUrl.startsWith('rediss://')) {
        this.logger.warn(
          { url: redisUrl },
          'Redis URL does not have a valid format. Expected redis:// or rediss://. Using in-memory storage.',
        );
        return;
      }

      this.client = new Redis(redisUrl);

      if (this.client) {
        // Add connection timeout
        const connectionTimeout = setTimeout(() => {
          this.logger.error('Redis connection timed out after 5 seconds');
          if (this.client) {
            this.client.disconnect();
            this.client = null;
          }
        }, 5000);

        this.client.on('connect', () => {
          clearTimeout(connectionTimeout);
          this.logger.info('Connected to Redis server');
        });

        this.client.on('error', (err: Error) => {
          clearTimeout(connectionTimeout);
          this.logger.error({ err }, 'Redis connection error');
          this.logger.warn('Falling back to in-memory session storage');

          // Only set to null if the client hasn't been changed elsewhere
          if (this.client) {
            this.client.disconnect();
            this.client = null;
          }
        });
      }
    } catch (err) {
      this.logger.error({ err }, 'Failed to initialize Redis client');
      this.logger.warn('Falling back to in-memory session storage');
      this.client = null;
    }
  }

  async set<T>(key: string, data: T, expiryInSeconds = 86400): Promise<boolean> {
    if (!this.client) {
      return false;
    }

    try {
      await this.client.set(this.keyPrefix + key, JSON.stringify(data), 'EX', expiryInSeconds);
      this.logger.debug({ key }, 'Data saved to Redis');
      return true;
    } catch (err) {
      this.logger.error({ err, key }, 'Failed to save data to Redis');
      return false;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.client) {
      return null;
    }

    try {
      const data = await this.client.get(this.keyPrefix + key);
      if (data) {
        return JSON.parse(data) as T;
      }
      return null;
    } catch (err) {
      this.logger.error({ err, key }, 'Failed to get data from Redis');
      return null;
    }
  }

  async delete(key: string): Promise<boolean> {
    if (!this.client) {
      return false;
    }

    try {
      await this.client.del(this.keyPrefix + key);
      this.logger.debug({ key }, 'Data deleted from Redis');
      return true;
    } catch (err) {
      this.logger.error({ err, key }, 'Failed to delete data from Redis');
      return false;
    }
  }

  async quit(): Promise<void> {
    if (this.client) {
      this.logger.info('Closing Redis connection');
      await this.client.quit();
      this.client = null;
    }
  }

  isConnected(): boolean {
    return this.client !== null;
  }
}
