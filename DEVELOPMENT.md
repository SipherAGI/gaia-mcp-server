# Development Guide

This document outlines the development workflow for the Gaia MCP Server.

## Project Structure

The project is organized into the following main directories:

- `src/` - Source code
  - `mcp/` - MCP server implementation
    - `tools/` - Tool implementations
    - `server.ts` - Main server class
  - `utils/` - Utility functions
  - `config/` - Configuration handling
  - `api/` - API clients
  - `index.ts` - Command-line interface

## Available Development Scripts

For development, you have several options to run the server with automatic reloading when files change:

### Using tsc-watch (Recommended)

This will compile TypeScript and restart the server when files change:

```bash
# Run the main server in development mode with stdio transport
pnpm run dev

# Run the server in development mode with SSE transport
pnpm run dev:sse
```

### Using nodemon

An alternative approach using nodemon configuration:

```bash
pnpm run dev:nodemon
```

### Using ts-node (No compilation needed)

Run TypeScript directly without compilation step:

```bash
# Run the main server with ts-node
pnpm run dev:ts-node

# Run the SSE server with ts-node
pnpm run dev:ts-node:sse
```

## Command-line Interface

The server provides a command-line interface through the `commander` package. The main commands are:

### Stdio Mode

```bash
# For development (requires ts-node)
pnpm run dev:ts-node -- stdio --api-key=your-api-key

# For production (after building)
node dist/index.js stdio --api-key=your-api-key
```

Options:

- `--api-key <api-key>` (required): The Gaia API key
- `--api-url <api-url>` (optional): The Gaia API URL (defaults to environment variable or built-in default)

### SSE Mode

```bash
# For development (requires ts-node)
pnpm run dev:ts-node -- sse

# For production (after building)
node dist/index.js sse
```

## Production Build

When deploying to production, use:

```bash
# Build the production-ready code
pnpm build

# Start the main server with stdio transport (requires API key)
node dist/index.js stdio --api-key=your-api-key

# Or start the SSE server
node dist/index.js sse
```

## Adding New Tools

To add a new tool to the MCP server:

1. Create a new file in `src/mcp/tools/` (e.g., `src/mcp/tools/my-tool.ts`)
2. Define the tool structure following the existing pattern:

```typescript
import { Tool } from '../base.js';

export const myTool: Tool = {
  name: 'my-tool',
  description: 'Description of my tool',
  parameters: {
    type: 'object',
    properties: {
      // Define your tool parameters here
      param1: {
        type: 'string',
        description: 'Description of parameter 1',
      },
    },
    required: ['param1'],
  },
  handler: async (args, context) => {
    const logger = context?.logger?.child({ tool: 'my-tool' }) || console;

    // Tool implementation
    logger.info('My tool called with args', args);

    // Return result
    return { result: 'success' };
  },
};
```

3. Add your tool to the tools array in `src/mcp/tools/index.ts`:

```typescript
import { myTool } from './my-tool.js';

export const tools = [
  // Existing tools...
  myTool,
];
```

## Configuration Files

The project uses the following configuration files:

- `.env` - Environment variables
- `nodemon.json` - Contains the configuration for nodemon
- `tsconfig.json` - TypeScript configuration
- `.eslintrc.json` - ESLint configuration
- `.prettierrc.json` - Prettier configuration

## Environment Variables

The following environment variables can be configured:

| Variable            | Description                                 | Default                          |
| ------------------- | ------------------------------------------- | -------------------------------- |
| GAIA_API_URL        | URL for the Gaia API                        | https://artventure-api.sipher.gg |
| MCP_SERVER_SSE_PORT | Port for the SSE server                     | 3000                             |
| REDIS_URL           | Redis connection URL                        | -                                |
| REDIS_KEY_PREFIX    | Prefix for Redis keys                       | gaia-mcp:sessions:               |
| LOG_LEVEL           | Log level (debug, info, warn, error, fatal) | info                             |
| AWS_PROFILE         | AWS profile for credentials                 | -                                |
| AWS_REGION          | AWS region for SSM parameters               | ap-southeast-1                   |

## Linting and Formatting

The project uses ESLint and Prettier for code quality:

```bash
# Run linting
pnpm run lint

# Fix linting issues
pnpm run lint:fix

# Format code
pnpm run format

# Check formatting
pnpm run format:check

# Run both lint and format check
pnpm run check

# Fix both lint and format issues
pnpm run fix
```
