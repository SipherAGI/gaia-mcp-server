import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import express from 'express';
import { Redis } from 'ioredis';
import { pino, Logger } from 'pino';
import { pinoHttp } from 'pino-http';

import { tools } from './tools/index.js';

export type GaiaMcpServerConfig = {
  sse?: {
    port: number;
  };
  gaia: {
    apiUrl: string;
    apiKey?: string;
  };
  redis?: {
    url?: string;
    host?: string;
    port?: number;
    password?: string;
    keyPrefix?: string;
  };
  logger?: Logger;
};

export type SSESessionData = {
  sessionId: string;
  apiKey: string;
};

export class GaiaMcpServer {
  private readonly serverName = 'GaiaMcpServer';
  private readonly serverVersion = '0.0.1';
  private readonly ssePort: number;
  private readonly logger: Logger;
  private readonly redisKeyPrefix: string;

  private server: McpServer;
  private gaiaConfig: {
    apiUrl: string;
    apiKey?: string;
  };
  // Redis client
  private redisClient: Redis | null = null;
  // Fallback in-memory sessions store if Redis is not configured
  private sessions: Map<string, SSESessionData> = new Map();

  constructor(cfg: GaiaMcpServerConfig) {
    this.server = new McpServer({
      name: this.serverName,
      version: this.serverVersion,
    });

    this.ssePort = cfg.sse?.port ?? 8000;
    this.gaiaConfig = {
      apiUrl: cfg.gaia.apiUrl,
      apiKey: cfg.gaia.apiKey ?? undefined,
    };
    this.logger =
      cfg.logger ||
      pino({
        level: process.env.LOG_LEVEL || 'info',
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
          },
        },
      });

    // Set Redis key prefix regardless of Redis configuration
    this.redisKeyPrefix = cfg.redis?.keyPrefix || 'gaia-mcp:sessions:';

    // Only initialize Redis if we have a valid configuration (URL or host)
    if (cfg.redis && (cfg.redis.url || cfg.redis.host)) {
      this.initRedis(cfg.redis);
    } else {
      this.logger.info('Redis not configured, using in-memory session storage');
    }
  }

  private initRedis(redisConfig: GaiaMcpServerConfig['redis']): void {
    try {
      if (!redisConfig) return;

      // Only attempt to connect if we have a URL or a valid host
      if (redisConfig.url) {
        this.logger.info('Connecting to Redis using URL');
        this.redisClient = new Redis(redisConfig.url);
      } else if (redisConfig.host) {
        this.logger.info(`Connecting to Redis using host: ${redisConfig.host}`);
        this.redisClient = new Redis({
          host: redisConfig.host,
          port: redisConfig.port || 6379,
          password: redisConfig.password,
        });
      } else {
        // No valid Redis configuration, fallback to in-memory storage
        this.logger.info('Incomplete Redis configuration, using in-memory session storage');
        return;
      }

      if (this.redisClient) {
        this.redisClient.on('connect', () => {
          this.logger.info('Connected to Redis server');
        });

        this.redisClient.on('error', (err: Error) => {
          this.logger.error({ err }, 'Redis connection error');
          this.logger.warn('Falling back to in-memory session storage');
          this.redisClient = null;
        });
      }
    } catch (err: unknown) {
      this.logger.error({ err }, 'Failed to initialize Redis client');
      this.logger.warn('Falling back to in-memory session storage');
      this.redisClient = null;
    }
  }

  private async saveSession(sessionId: string, data: SSESessionData): Promise<void> {
    if (this.redisClient) {
      try {
        await this.redisClient.set(
          this.redisKeyPrefix + sessionId,
          JSON.stringify(data),
          'EX',
          86400, // 24 hours expiration
        );
        this.logger.debug({ sessionId }, 'Session saved to Redis');
      } catch (err: unknown) {
        this.logger.error({ err, sessionId }, 'Failed to save session to Redis');
        // Fallback to in-memory
        this.sessions.set(sessionId, data);
      }
    } else {
      // Store in memory if Redis is not available
      this.sessions.set(sessionId, data);
    }
  }

  private async getSession(sessionId: string): Promise<SSESessionData | undefined> {
    if (this.redisClient) {
      try {
        const data = await this.redisClient.get(this.redisKeyPrefix + sessionId);
        if (data) {
          return JSON.parse(data) as SSESessionData;
        }
        return undefined;
      } catch (err: unknown) {
        this.logger.error({ err, sessionId }, 'Failed to get session from Redis');
        // Fallback to in-memory
        return this.sessions.get(sessionId);
      }
    } else {
      // Use in-memory if Redis is not available
      return this.sessions.get(sessionId);
    }
  }

  private async deleteSession(sessionId: string): Promise<void> {
    if (this.redisClient) {
      try {
        await this.redisClient.del(this.redisKeyPrefix + sessionId);
        this.logger.debug({ sessionId }, 'Session deleted from Redis');
      } catch (err: unknown) {
        this.logger.error({ err, sessionId }, 'Failed to delete session from Redis');
        // Fallback to in-memory
        this.sessions.delete(sessionId);
      }
    } else {
      // Use in-memory if Redis is not available
      this.sessions.delete(sessionId);
    }
  }

  private init() {
    this.logger.info('Initializing...');

    // Graceful shutdown
    process.on('SIGINT', async () => {
      this.logger.info('Shutting down...');

      // Close Redis connection if available
      if (this.redisClient) {
        this.logger.info('Closing Redis connection');
        await this.redisClient.quit();
      }

      await this.server.close();
      this.logger.info('Server closed');
      process.exit(0);
    });

    // Register tools
    this.registerTools();
  }

  private registerTools() {
    for (const tool of tools) {
      this.server.tool(
        tool.name,
        tool.description,
        tool.parameters,
        async (args: Record<string, any>, extra: { sessionId?: string }) => {
          // Get session-specific API key or fall back to default
          let apiKey = this.gaiaConfig.apiKey;

          if (extra?.sessionId) {
            const sessionData = await this.getSession(extra.sessionId);
            if (sessionData?.apiKey) {
              apiKey = sessionData.apiKey;
            }
          }

          // Create context with the session's API key or fall back to default
          const context = {
            apiConfig: {
              url: this.gaiaConfig.apiUrl,
              key: apiKey,
            },
            logger: this.logger.child({ tool: tool.name }),
          };

          // Pass context to the tool handler
          return await tool.handler(args, context);
        },
      );
    }
  }

  async startSSE() {
    this.init();

    // keep track of multiple SSE connections
    const transports: { [sessionId: string]: SSEServerTransport } = {};
    const expressApp = express();

    // Add pino-http middleware
    const httpLogger = pinoHttp({
      logger: this.logger,
    });
    expressApp.use(httpLogger);

    // handle SSE connection
    expressApp.get('/sse', async (req, res) => {
      // Get api key from query params
      const apiKey = req.query.apiKey as string;
      if (!apiKey) {
        res.status(400).send('API key is required');
        return;
      }

      const transport = new SSEServerTransport('/messages', res);
      const sessionId = transport.sessionId;

      this.logger.info({ sessionId }, 'New SSE connection established');

      // Store session data for this session
      await this.saveSession(sessionId, {
        sessionId,
        apiKey,
      });

      // Store transport
      transports[sessionId] = transport;

      res.on('close', async () => {
        // Clean up session data when connection closes
        delete transports[sessionId];
        await this.deleteSession(sessionId);
        this.logger.info({ sessionId }, 'SSE connection closed');
      });

      await this.server.connect(transport);
    });

    // handle POST message request
    expressApp.post('/messages', async (req, res) => {
      const sessionId = req.query.sessionId as string;
      const transport = transports[sessionId];

      // if session not found, return 404
      if (!transport) {
        this.logger.warn({ sessionId }, 'Session not found for message');
        res.status(404).send('Session not found');
        return;
      }

      // handle POST message request
      await transport.handlePostMessage(req, res);
    });

    // health check endpoint
    expressApp.get('/health', (_, res) => {
      res.status(200).send('OK');
    });

    expressApp.get('/', (_, res) => {
      res.status(200).json({
        message: 'This is the SSE MCP server of ProtoGaia. Check more: https://protogaia.com/',
      });
    });

    // start SSE server
    expressApp.listen(this.ssePort, () => {
      this.logger.info(`SSE server started on port ${this.ssePort}`);
    });
  }

  async start() {
    this.init();

    // STDIO transport
    const transport = new StdioServerTransport();
    this.logger.info('Starting server with STDIO transport');
    await this.server.connect(transport);
  }
}
