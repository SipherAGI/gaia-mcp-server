import dotenv from 'dotenv';
import { Logger } from 'pino';

import { isSSMParameterReference, resolveSSMParameter } from '../utils/aws-ssm.js';
import {
  DEFAULT_GAIA_API_URL,
  DEFAULT_REDIS_KEY_PREFIX,
  DEFAULT_REDIS_URL,
  DEFAULT_SSE_PORT,
} from '../utils/constants.js';
import { createLogger } from '../utils/logger.js';

let config: Config | null = null;

class Config {
  private static instance: Config;
  private readonly logger: Logger;
  private initialized = false;
  private envs: Record<string, string> = {
    GaiaApiUrl: 'GAIA_API_URL',
    RedisUrl: 'REDIS_URL',
    RedisKeyPrefix: 'REDIS_KEY_PREFIX',
    LogLevel: 'LOG_LEVEL',
  };

  private constructor(silent = false) {
    // init dotenv
    dotenv.config();

    if (silent) {
      process.env.LOG_LEVEL = 'silent';
    }

    // init root logger
    this.logger = createLogger({ name: 'Config', level: process.env.LOG_LEVEL || 'info' });
  }

  private async resolveSSMParameters() {
    // Iterate overall env vars
    for (const [key, value] of Object.entries(process.env)) {
      if (value === undefined || typeof value !== 'string') {
        continue;
      }

      // Check if the value is a valid SSM parameter reference
      if (isSSMParameterReference(value)) {
        // Resolve the SSM parameter
        const resolvedValue = await resolveSSMParameter(value);
        // Update the env var with the resolved value
        process.env[key] = resolvedValue;

        this.logger.debug({ key, value }, 'Resolved SSM parameter');
      }
    }

    this.logger.info('Config initialized');
  }

  private isInitialized() {
    if (!this.initialized) {
      throw new Error('Config not initialized');
    }
  }

  public static getConfig(silent = false): Config {
    if (!Config.instance) {
      Config.instance = new Config(silent);
    }

    return Config.instance;
  }

  public async initialize() {
    await this.resolveSSMParameters();

    this.initialized = true;
  }

  public getEnv(key: keyof typeof this.envs) {
    this.isInitialized();

    const envKey = this.envs[key];
    return envKey ? process.env[envKey] : undefined;
  }

  public getEnvs(keys: (keyof typeof this.envs)[]) {
    this.isInitialized();

    return keys.reduce(
      (acc, key) => {
        acc[key] = this.getEnv(key);
        return acc;
      },
      {} as Record<keyof typeof this.envs, string | undefined>,
    );
  }

  public get gaiaApiUrl(): string {
    return this.getEnv('GaiaApiUrl') ?? DEFAULT_GAIA_API_URL;
  }

  public get ssePort(): number {
    return parseInt(this.getEnv('SSEPort') ?? DEFAULT_SSE_PORT.toString());
  }

  public get redisUrl(): string {
    return this.getEnv('RedisUrl') ?? DEFAULT_REDIS_URL;
  }

  public get redisKeyPrefix(): string {
    return this.getEnv('RedisKeyPrefix') ?? DEFAULT_REDIS_KEY_PREFIX;
  }

  public get logLevel(): string {
    return this.getEnv('LogLevel') ?? 'info';
  }
}

type getConfigOptions = {
  silent?: boolean;
};

export async function getConfig(options?: getConfigOptions): Promise<Config> {
  if (!config) {
    config = Config.getConfig(options?.silent);
    await config.initialize();
  }

  return config;
}
