import dotenv from 'dotenv';

export class Config {
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

  public static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config();
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
