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
      apiKey: string;
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
        apiKey: process.env.GAIA_API_KEY ?? '',
      },
    };
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
    apiKey: string;
  } {
    return this.config.gaia;
  }

  public setGaiaApiKey(apiKey: string) {
    this.config.gaia.apiKey = apiKey;
  }
}

export default Config.getInstance();
