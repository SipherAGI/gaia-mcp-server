import config from './config/index.js';
import { GaiaMcpServer } from './mcp/gaia-mcp-server.js';
import { logger } from './utils/logger.js';

// Create server with logger
const gaiaMcpServer = new GaiaMcpServer({
  gaia: {
    apiUrl: config.gaiaConfig.apiUrl,
  },
  logger: logger.child({ component: 'GaiaMcpServer' }),
});

// Start server with stdio transport
gaiaMcpServer.start().catch(err => {
  logger.error({ err }, 'Error starting server');
  process.exit(1);
});
