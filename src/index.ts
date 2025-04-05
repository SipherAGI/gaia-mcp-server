import { GaiaMcpServer } from "./mcp/gaia-mcp-server";
import config from "./config";

const gaiaMcpServer = new GaiaMcpServer({
  gaia: {
    apiUrl: config.gaiaConfig.apiUrl,
    apiKey: config.gaiaConfig.apiKey,
  }
});

gaiaMcpServer.start().catch((err) => {
  console.error('[SSE] Error starting SSE server: ', err);
  process.exit(1);
});
