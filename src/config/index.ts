import dotenv from "dotenv";

export class Config {
  private static instance: Config;
  private config: {
    mcpServer: {
      sse: {
        port: number;
      },
    },
  }

  private constructor() {
    // init dotenv
    dotenv.config();

    this.config = {
      mcpServer: {
        sse: {
          port: 3000,
        },
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
    }
  } {
    return this.config.mcpServer;
  }
}

export default Config.getInstance();