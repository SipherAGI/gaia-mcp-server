import { Config } from './config/index.js';
import { GaiaMcpServer } from './mcp/gaia-mcp-server.js';
import { logger } from './utils/logger.js';

// Main async function to ensure we can use await
async function main() {
  try {
    // Get initialized config with resolved SSM parameters
    const config = await Config.getInitializedInstance();
    logger.info('Configuration initialized, starting server');

    // Create server with logger
    const gaiaMcpServer = new GaiaMcpServer({
      gaia: {
        apiUrl: config.gaiaConfig.apiUrl,
      },
      logger: logger.child({ component: 'GaiaMcpServer' }),
    });

    // Start server with stdio transport
    await gaiaMcpServer.start();
  } catch (err) {
    logger.error({ err }, 'Error starting server');
    process.exit(1);
  }
}

// Start the application
main().catch(err => {
  logger.error({ err }, 'Unhandled error in main');
  process.exit(1);
});
