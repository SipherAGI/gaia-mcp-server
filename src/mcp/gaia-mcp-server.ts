import express from "express";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { tools } from "./tools";
export type GaiaMcpServerConfig = {
  sse?: {
    port: number;
  }
}

export class GaiaMcpServer {
  private readonly serverName = "GaiaMcpServer";
  private readonly serverVersion = "0.0.1";

  private server: McpServer;
  private ssePort: number;

  constructor(cfg: GaiaMcpServerConfig) {
    this.server = new McpServer({
      name: this.serverName,
      version: this.serverVersion,
    });

    this.ssePort = cfg.sse?.port ?? 8000;
  }

  private init() {
    console.log('[GAIA-MCP-SERVER] Initializing...');

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('[GAIA-MCP-SERVER] Shutting down...');
      await this.server.close();
      console.log('[GAIA-MCP-SERVER] Server closed');
      process.exit(0);
    });

    // Register tools
    this.registerTools();
  }

  private registerTools() {
    for (const tool of tools) {
      this.server.tool(tool.name, tool.description, tool.parameters, tool.handler);
    }
  }

  async startSSE() {
    this.init();

    // keep track of multiple SSE connections
    const transports: { [sessionId: string]: SSEServerTransport } = {};
    const expressApp = express();

    // handle SSE connection
    expressApp.get('/sse', async (_, res) => {
      const transport = new SSEServerTransport('/messages', res);
      transports[transport.sessionId] = transport;

      res.on('close', () => {
        delete transports[transport.sessionId];
      })

      await this.server.connect(transport);
    })

    // handle POST message request
    expressApp.post('/messages', async (req, res) => {
      const sessionId = req.query.sessionId as string;
      const transport = transports[sessionId];

      // if session not found, return 404
      if (!transport) {
        res.status(404).send('Session not found');
        return;
      }

      // handle POST message request
      await transport.handlePostMessage(req, res);
    })

    // health check endpoint
    expressApp.get('/health', (_, res) => {
      res.status(200).send('OK');
    })

    // start SSE server
    expressApp.listen(this.ssePort, () => {
      console.log(`[GAIA-MCP-SERVER] SSE server started on port ${this.ssePort}`);
    })
  }

  async start() {
    this.init();

    // STDIO transport
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}
