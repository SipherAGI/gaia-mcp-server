import { Config } from './config/index.js';
import { GaiaMcpServer } from './mcp/gaia-mcp-server.js';
import { logger } from './utils/logger.js';

// Main async function to ensure we can use await
async function main() {
  try {
    logger.info(
      'Starting server initialization, waiting for configuration to be fully resolved...',
    );

    // Get fully initialized config with all resolved SSM parameters
    // This will wait until all parameters are resolved before continuing
    const config = await Config.getInitializedInstance();

    if (!Config.isInitialized()) {
      throw new Error('Configuration failed to initialize completely');
    }

    logger.info('Configuration fully initialized, starting stdio server');

    // Create server with logger
    const gaiaMcpServer = new GaiaMcpServer({
      gaia: {
        apiUrl: config.gaiaConfig.apiUrl,
      },
      logger: logger.child({ component: 'GaiaMcpServer', mode: 'STDIO' }),
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
