import { Config } from './config/index.js';
import { GaiaMcpServer } from './mcp/gaia-mcp-server.js';
import { logger } from './utils/logger.js';

// Main async function to ensure we can use await
async function main() {
  try {
    // Get initialized config with resolved SSM parameters
    const config = await Config.getInitializedInstance();
    logger.info('Configuration initialized, starting SSE server');

    const gaiaMcpServer = new GaiaMcpServer({
      sse: {
        port: config.mcpServerConfig.sse.port,
      },
      gaia: {
        apiUrl: config.gaiaConfig.apiUrl,
      },
      redis: config.redisConfig,
      logger: logger.child({ component: 'GaiaMcpServer', mode: 'SSE' }),
    });

    await gaiaMcpServer.startSSE();
  } catch (err) {
    logger.error({ err }, 'Error starting SSE server');
    process.exit(1);
  }
}

// Start the application
main().catch(err => {
  logger.error({ err }, 'Unhandled error in main');
  process.exit(1);
});
