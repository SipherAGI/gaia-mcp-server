import config from "./config";
import { GaiaMcpServer } from "./mcp/gaia-mcp-server";

const gaiaMcpServer = new GaiaMcpServer({
  sse: {
    port: config.mcpServerConfig.sse.port,
  },
  gaia: {
    apiUrl: config.gaiaConfig.apiUrl,
    apiKey: config.gaiaConfig.apiKey,
  }
});

gaiaMcpServer.startSSE().catch((err) => {
  console.error('[SSE] Error starting SSE server: ', err);
  process.exit(1);
});
