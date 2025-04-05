import config from './config/index.js';
import { GaiaMcpServer } from './mcp/gaia-mcp-server.js';
import { logger } from './utils/logger.js';

const gaiaMcpServer = new GaiaMcpServer({
  sse: {
    port: config.mcpServerConfig.sse.port,
  },
  gaia: {
    apiUrl: config.gaiaConfig.apiUrl,
    apiKey: config.gaiaConfig.apiKey,
  },
  logger: logger.child({ component: 'GaiaMcpServer', mode: 'SSE' }),
});

gaiaMcpServer.startSSE().catch(err => {
  logger.error({ err }, 'Error starting SSE server');
  process.exit(1);
});
