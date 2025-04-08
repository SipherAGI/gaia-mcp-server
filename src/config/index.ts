import dotenv from 'dotenv';

import { isSSMParameterReference, resolveSSMParameter } from '../utils/aws-ssm.js';
import { resolveConfig } from '../utils/config-resolver.js';
import { logger } from '../utils/logger.js';

export class Config {
  private static initialized = false;
  private static initializing = false;
  private static instance: Config;
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
      url?: string;
      host?: string;
      port?: number;
      password?: string;
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

    // Only add Redis config if Redis URL or host is provided
    if (process.env.REDIS_URL || process.env.REDIS_HOST) {
      this.config.redis = {
        url: process.env.REDIS_URL,
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : undefined,
        password: process.env.REDIS_PASSWORD,
        keyPrefix: process.env.REDIS_KEY_PREFIX || 'gaia-mcp:sessions:',
      };
    }
  }

  /**
   * Initialize the configuration, resolving any SSM parameter references
   */
  private static async initialize(): Promise<void> {
    if (Config.initialized || Config.initializing) {
      return;
    }

    Config.initializing = true;
    const configLogger = logger.child({ component: 'Config' });

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
        Config.instance.config.redis.url = await resolveSSMParameter(
          Config.instance.config.redis.url,
        );
      }

      if (
        Config.instance.config.redis?.password &&
        isSSMParameterReference(Config.instance.config.redis.password)
      ) {
        configLogger.info('Resolving SSM parameter for Redis password');
        Config.instance.config.redis.password = await resolveSSMParameter(
          Config.instance.config.redis.password,
        );
      }

      // Resolve any other SSM parameters in the config
      Config.instance.config = await resolveConfig(Config.instance.config);

      Config.initialized = true;
      configLogger.info('Configuration initialized with resolved SSM parameters');
    } catch (error) {
      configLogger.error({ error }, 'Failed to initialize configuration with SSM parameters');
    } finally {
      Config.initializing = false;
    }
  }

  /**
   * Get the Config instance, initializing it if necessary
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
   * Get the Config instance, ensuring all SSM parameters are resolved
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
        url?: string;
        host?: string;
        port?: number;
        password?: string;
        keyPrefix?: string;
      }
    | undefined {
    return this.config.redis;
  }
}

export default Config.getInstance();
