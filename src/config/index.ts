import dotenv from 'dotenv';

import { isSSMParameterReference, resolveSSMParameter } from '../utils/aws-ssm.js';
import { resolveConfig } from '../utils/config-resolver.js';
import { logger } from '../utils/logger.js';

export class Config {
  private static initialized = false;
  private static initializing = false;
  private static instance: Config;
  private static initializationPromise: Promise<void> | null = null;
  private config: {
    mcpServer: {
      sse: {
        port: number;
      };
    };
    gaia: {
      apiUrl: string;
    };
    redis?: {
      url: string;
      keyPrefix?: string;
    };
  };

  private constructor() {
    // init dotenv
    dotenv.config();

    this.config = {
      mcpServer: {
        sse: {
          port: 3000,
        },
      },
      gaia: {
        apiUrl: process.env.GAIA_API_URL ?? 'https://artventure-api.sipher.gg',
      },
    };

    // Handle Redis configuration - prioritize URL or build it from components
    if (process.env.REDIS_URL || process.env.REDIS_HOST) {
      let redisUrl: string;

      // If REDIS_URL is provided, use it directly
      if (process.env.REDIS_URL) {
        redisUrl = process.env.REDIS_URL;
      }
      // Otherwise, build URL from individual components
      else if (process.env.REDIS_HOST) {
        const host = process.env.REDIS_HOST;
        const port = process.env.REDIS_PORT || '6379';
        const password = process.env.REDIS_PASSWORD
          ? `:${encodeURIComponent(process.env.REDIS_PASSWORD)}@`
          : '';

        redisUrl = `redis://${password}${host}:${port}`;
      }
      // Fallback (shouldn't happen due to the if condition above)
      else {
        redisUrl = 'redis://localhost:6379';
      }

      // Create Redis config with the URL
      this.config.redis = {
        url: redisUrl,
        keyPrefix: process.env.REDIS_KEY_PREFIX || 'gaia-mcp:sessions:',
      };
    }
  }

  /**
   * Initialize the configuration, resolving any SSM parameter references
   */
  private static async initialize(): Promise<void> {
    if (Config.initialized) {
      return;
    }

    if (Config.initializing && Config.initializationPromise) {
      return Config.initializationPromise;
    }

    Config.initializing = true;
    const configLogger = logger.child({ component: 'Config' });
    configLogger.info('Starting configuration initialization');

    Config.initializationPromise = (async () => {
      try {
        // Create the instance if it doesn't exist
        if (!Config.instance) {
          Config.instance = new Config();
        }

        // Resolve any SSM parameter references in the config
        if (
          Config.instance.config.redis?.url &&
          isSSMParameterReference(Config.instance.config.redis.url)
        ) {
          configLogger.info(
            { url: Config.instance.config.redis.url },
            'Resolving SSM parameter for Redis URL',
          );

          try {
            const originalUrl = Config.instance.config.redis.url;
            const resolvedUrl = await resolveSSMParameter(originalUrl);

            // Make sure the resolved URL is valid for Redis
            if (!resolvedUrl.startsWith('redis://') && !resolvedUrl.startsWith('rediss://')) {
              configLogger.warn(
                { resolvedUrl },
                'Resolved SSM parameter is not a valid Redis URL. Disabling Redis.',
              );
              Config.instance.config.redis = undefined;
            } else {
              Config.instance.config.redis.url = resolvedUrl;
            }
          } catch (error) {
            configLogger.error(
              { error },
              'Failed to resolve Redis URL SSM parameter. Disabling Redis.',
            );
            // If we can't resolve the SSM parameter, disable Redis entirely
            Config.instance.config.redis = undefined;
          }
        }

        // Resolve any other SSM parameters in the config
        Config.instance.config = await resolveConfig(Config.instance.config);

        Config.initialized = true;
        Config.initializing = false;
        configLogger.info('Configuration successfully initialized with resolved SSM parameters');
      } catch (error) {
        Config.initializing = false;
        configLogger.error({ error }, 'Failed to initialize configuration with SSM parameters');
        throw error;
      }
    })();

    return Config.initializationPromise;
  }

  /**
   * Get the Config instance, initializing it if necessary.
   * This doesn't wait for SSM parameter resolution to complete.
   * @returns The Config instance
   */
  public static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config();
      // Start the initialization process asynchronously
      Config.initialize().catch(err => {
        logger.error({ err }, 'Failed to initialize config with SSM parameters');
      });
    }
    return Config.instance;
  }

  /**
   * Get the Config instance, ensuring all SSM parameters are resolved.
   * This method waits for the initialization to complete before returning.
   * @returns A promise that resolves to the Config instance
   */
  public static async getInitializedInstance(): Promise<Config> {
    if (!Config.instance) {
      Config.instance = new Config();
    }

    if (!Config.initialized) {
      await Config.initialize();
    }

    return Config.instance;
  }

  /**
   * Check if the configuration has been fully initialized
   * @returns True if config is initialized, false otherwise
   */
  public static isInitialized(): boolean {
    return Config.initialized;
  }

  public get mcpServerConfig(): {
    sse: {
      port: number;
    };
  } {
    return this.config.mcpServer;
  }

  public get gaiaConfig(): {
    apiUrl: string;
  } {
    return this.config.gaia;
  }

  public get redisConfig():
    | {
        url: string;
        keyPrefix?: string;
      }
    | undefined {
    return this.config.redis;
  }
}

// Not exporting a default instance to encourage using getInitializedInstance
// This would be a breaking change, so keeping the default export for backwards compatibility
export default Config.getInstance();
