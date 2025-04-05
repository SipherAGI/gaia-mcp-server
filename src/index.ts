import { GaiaMcpServer } from "./mcp/gaia-mcp-server";
import config from "./config";
import { logger } from "./utils/logger";

// Create server with logger
const gaiaMcpServer = new GaiaMcpServer({
  gaia: {
    apiUrl: config.gaiaConfig.apiUrl,
    apiKey: config.gaiaConfig.apiKey,
  },
  logger: logger.child({ component: 'GaiaMcpServer' }),
});

// Start server with stdio transport
gaiaMcpServer.start().catch((err) => {
  logger.error({ err }, 'Error starting server');
  process.exit(1);
});
