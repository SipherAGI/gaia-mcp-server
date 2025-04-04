import { GaiaMcpServer } from "./mcp/gaia-mcp-server";

const gaiaMcpServer = new GaiaMcpServer({});

gaiaMcpServer.start().catch((err) => {
  console.error('[SSE] Error starting SSE server: ', err);
  process.exit(1);
});
