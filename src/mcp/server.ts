import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import express from 'express';
import { Logger } from 'pino';
import { pinoHttp } from 'pino-http';

import { DEFAULT_GAIA_API_URL } from '../utils/constants.js';
import { createLogger } from '../utils/logger.js';
import { RedisClient } from '../utils/redis-client.js';
import { tools } from './tools/index.js';

/**
 * Session data for SSE connections
 *
 * @property sessionId - Unique identifier for the session
 * @property apiKey - API key associated with the session
 */
type SSESessionData = {
  sessionId: string;
  apiKey: string;
};

/**
 * Configuration options for the SSE server
 *
 * @property port - Port number to run the server on
 * @property redisClient - Optional Redis client for session persistence
 */
type SSEConfig = {
  port: number;
  redisClient?: RedisClient;
};

/**
 * Configuration options for the GaiaMcpServer
 *
 * @property apiUrl - Gaia API URL to connect to
 * @property apiKey - Optional API key for authenticating with Gaia
 * @property logger - Optional custom logger instance
 */
type GaiaMcpServerOptions = {
  apiUrl: string;
  apiKey?: string;
  logger?: Logger;
  version?: string;
};

/**
 * GaiaMcpServer implements a Model Context Protocol server for Gaia
 * with support for SSE and STDIO transports.
 *
 * The server handles tool registrations and session management,
 * with optional Redis-based persistence for SSE sessions.
 */
export class GaiaMcpServer {
  private readonly logger: Logger;
  private server: McpServer;

  // Gaia config
  private readonly apiUrl: string = DEFAULT_GAIA_API_URL;
  private readonly apiKey: string | undefined;

  // Redis client
  private redisClient: RedisClient | null = null;
  // Fallback in-memory sessions store if Redis is not configured
  private sessions: Map<string, SSESessionData> = new Map();

  /**
   * Creates a new GaiaMcpServer instance
   *
   * @param options - Configuration options for the server
   * @param options.apiUrl - Gaia API URL to connect to
   * @param options.apiKey - Optional API key for authenticating with Gaia
   * @param options.logger - Optional custom logger instance
   */
  constructor(options: GaiaMcpServerOptions) {
    const { apiUrl, apiKey, logger, version } = options;

    this.server = new McpServer(
      {
        name: 'GaiaMcpServer',
        version: version || 'unknown',
      },
      {
        capabilities: {
          tools: {},
        },
      },
    );

    this.apiUrl = apiUrl;
    this.apiKey = apiKey;

    if (logger) {
      this.logger = logger;
    } else {
      this.logger = createLogger({ name: 'GaiaMcpServer' });
    }
  }

  /**
   * Starts the server with STDIO transport
   *
   * This method initializes the server and connects it with
   * standard input/output for terminal-based operation.
   */
  public async startStdio() {
    this.initialize();

    this.logger.info('Starting server with STDIO transport');
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }

  /**
   * Starts the server with SSE (Server-Sent Events) transport
   *
   * This method sets up an Express server to handle SSE connections
   * and message routing, with optional Redis-based session persistence.
   *
   * @param sseCfg - SSE configuration options
   * @param sseCfg.port - Port to run the SSE server on
   * @param sseCfg.redisClient - Optional Redis client for session persistence
   */
  public async startSSE(sseCfg: SSEConfig) {
    const { port, redisClient } = sseCfg;

    if (redisClient) {
      this.redisClient = redisClient;
    }

    this.initialize();

    // Keep track of multiple SSE connections
    const transports: { [sessionId: string]: SSEServerTransport } = {};
    const expressApp = express();

    // Add pino-http middleware
    const httpLogger = pinoHttp({
      logger: this.logger,
    });
    expressApp.use(httpLogger);

    // Handle SSE connection
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
      await this.saveSessionData(sessionId, {
        sessionId,
        apiKey,
      });

      // Store transport
      transports[sessionId] = transport;

      res.on('close', async () => {
        // Clean up session data when connection closes
        delete transports[sessionId];
        await this.deleteSessionData(sessionId);
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
    expressApp.listen(port, () => {
      this.logger.info(`SSE server started on port ${port}`);
    });
  }

  /**
   * Initializes the server by setting up shutdown handlers and registering tools
   *
   * @private
   */
  private initialize() {
    this.logger.info('Initializing MCP server...');

    // Graceful shutdown
    process.on('SIGINT', async () => {
      this.logger.info('Shutting down...');

      // Close Redis connection if available
      if (this.redisClient) {
        await this.redisClient.quit();
      }

      await this.server.close();
      this.logger.info('Server closed');
      process.exit(0);
    });

    // Register tools
    this.registerTools();
  }

  /**
   * Registers all available tools with the MCP server
   *
   * @private
   */
  private registerTools() {
    for (const tool of tools) {
      this.server.tool(
        tool.name,
        tool.description,
        tool.parameters,
        async (args: Record<string, any>, extra: { sessionId?: string }) => {
          // Get session-specific API key or fall back to default
          let apiKey = this.apiKey;

          if (extra?.sessionId) {
            const sessionData = await this.getSessionData(extra.sessionId);
            if (sessionData?.apiKey) {
              apiKey = sessionData.apiKey;
            }
          }

          // Create context with the session's API key or fall back to default
          const context = {
            apiConfig: {
              url: this.apiUrl,
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

  /**
   * Retrieves session data for a given session ID
   *
   * Uses Redis if available, with fallback to in-memory storage.
   *
   * @param sessionId - The unique session identifier
   * @returns The session data or null if not found
   * @private
   */
  private async getSessionData(sessionId: string): Promise<SSESessionData | null> {
    if (this.redisClient) {
      const data = await this.redisClient.get<SSESessionData>(sessionId);
      if (data) {
        return data;
      }
    }

    // Fallback to in-memory sessions store
    return this.sessions.get(sessionId) ?? null;
  }

  /**
   * Saves session data for a given session ID
   *
   * Uses Redis if available, with fallback to in-memory storage.
   *
   * @param sessionId - The unique session identifier
   * @param data - The session data to store
   * @private
   */
  private async saveSessionData(sessionId: string, data: SSESessionData): Promise<void> {
    if (this.redisClient) {
      const success = await this.redisClient.set(sessionId, data);
      if (!success) {
        // Fallback to in-memory if Redis save fails
        this.sessions.set(sessionId, data);
      }
    } else {
      // Store in memory if Redis is not available
      this.sessions.set(sessionId, data);
    }
  }

  /**
   * Deletes session data for a given session ID
   *
   * Removes data from both Redis (if available) and in-memory storage.
   *
   * @param sessionId - The unique session identifier
   * @private
   */
  private async deleteSessionData(sessionId: string): Promise<void> {
    if (this.redisClient) {
      await this.redisClient.delete(sessionId);
    }
    // Always try to delete from in-memory store as well
    this.sessions.delete(sessionId);
  }
}
