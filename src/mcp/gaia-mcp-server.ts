import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import express from 'express';
import { pino, Logger } from 'pino';
import { pinoHttp } from 'pino-http';

import { tools } from './tools/index.js';

export type GaiaMcpServerConfig = {
  sse?: {
    port: number;
  };
  gaia: {
    apiUrl: string;
    apiKey: string;
  };
  logger?: Logger;
};

export class GaiaMcpServer {
  private readonly serverName = 'GaiaMcpServer';
  private readonly serverVersion = '0.0.1';

  private server: McpServer;
  private ssePort: number;
  private gaiaConfig: {
    apiUrl: string;
    apiKey: string;
  };
  private logger: Logger;
  // Store API keys by session ID
  private sessionApiKeys: Map<string, string> = new Map();

  constructor(cfg: GaiaMcpServerConfig) {
    this.server = new McpServer({
      name: this.serverName,
      version: this.serverVersion,
    });

    this.ssePort = cfg.sse?.port ?? 8000;
    this.gaiaConfig = cfg.gaia;
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
  }

  private init() {
    this.logger.info('Initializing...');

    // Graceful shutdown
    process.on('SIGINT', async () => {
      this.logger.info('Shutting down...');
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
          const apiKey = extra?.sessionId ? this.sessionApiKeys.get(extra.sessionId) : undefined;

          // Create context with the session's API key or fall back to default
          const context = {
            apiConfig: {
              url: this.gaiaConfig.apiUrl,
              key: apiKey || this.gaiaConfig.apiKey,
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

      // Store API key for this session
      this.sessionApiKeys.set(sessionId, apiKey);

      // Store transport
      transports[sessionId] = transport;

      res.on('close', () => {
        // Clean up session data when connection closes
        delete transports[sessionId];
        this.sessionApiKeys.delete(sessionId);
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
