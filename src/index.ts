#!/usr/bin/env node
import { program } from 'commander';

import { getConfig } from './config/index.js';
import { GaiaMcpServer } from './mcp/server.js';
import { DEFAULT_GAIA_API_URL } from './utils/constants.js';
import { createLogger } from './utils/logger.js';
import { RedisClient } from './utils/redis-client.js';

program.name('gaia-mcp-server').description('Gaia MCP Server').version('1.0.0');

program
  .command('sse')
  .description('Start the remote MCP server with SSE')
  .action(async () => {
    const config = await getConfig();
    const logger = createLogger({ name: 'GaiaMcpServer', level: config.logLevel });

    const gaiaMcpServer = new GaiaMcpServer({
      apiUrl: config.getEnv('GaiaApiUrl') ?? DEFAULT_GAIA_API_URL,
      logger,
    });

    const redisClient = new RedisClient({
      url: config.getEnv('RedisUrl') ?? '',
      logger,
    });

    await gaiaMcpServer.startSSE({
      port: config.ssePort,
      redisClient,
    });
  });

program
  .command('stdio')
  .description('Start the local MCP server with stdio')
  .option('--api-url <api-url>', 'The Gaia API URL to use for local MCP server')
  .option('--api-key <api-key>', 'The Gaia API key to use for local MCP server')
  .action(async options => {
    // API key is required
    if (!options.apiKey) {
      throw new Error('API key is required');
    }

    // Initialize config with silent mode to avoid logger logs to stdout
    // It maybe conflicts with stdio transport
    const config = await getConfig({ silent: true });
    const logger = createLogger({ name: 'GaiaMcpServer', level: config.logLevel });

    const gaiaMcpServer = new GaiaMcpServer({
      apiUrl: options.apiUrl ?? config.getEnv('GaiaApiUrl') ?? DEFAULT_GAIA_API_URL,
      apiKey: options.apiKey,
      logger,
    });

    await gaiaMcpServer.startStdio();
  });

program.parse(process.argv);
