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

## Local Development Setup

1. Clone this repository:

   ```bash
   git clone https://github.com/yourusername/gaia-mcp-server.git
   cd gaia-mcp-server
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Create a `.env` file in the root directory with your configuration (see Configuration section in README.md)

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

## Redis Integration

The Gaia MCP Server can use Redis for session storage, which is particularly useful for deployments with multiple server instances.

### Configuration

Redis can be configured in one of two ways:

1. **Connection String (Preferred)**: Use the `REDIS_URL` environment variable to specify a complete Redis connection string.

   ```
   REDIS_URL='redis://username:password@host:port'
   ```

2. **Individual Parameters**: Specify individual connection parameters using separate environment variables. These will be automatically combined into a Redis URL internally.
   ```
   REDIS_HOST='localhost'
   REDIS_PORT=6379
   REDIS_PASSWORD='your-redis-password'
   ```

If both the connection string and individual parameters are provided, the connection string (`REDIS_URL`) takes precedence.

Regardless of which method you use, you can set a key prefix for Redis keys:

```
REDIS_KEY_PREFIX='gaia-mcp:sessions:'
```

### AWS Parameter Store Integration

For enhanced security, especially in production environments, you can store sensitive configuration values like Redis connection strings or passwords in AWS Parameter Store and reference them in your environment variables.

To use a value from AWS Parameter Store, prefix the value with `ssm:` followed by the parameter path:

```
# Using SSM for Redis URL
REDIS_URL='ssm:/gaia-mcp-server/dev/redis'

# Using SSM for Redis password (when using individual parameters)
REDIS_PASSWORD='ssm:/gaia-mcp-server/dev/redis-password'
```

When the application starts, it will automatically detect these SSM references and fetch the actual values from AWS Parameter Store. This approach keeps sensitive information out of your codebase and environment files.

#### Requirements for AWS Parameter Store

- AWS credentials must be configured in the environment where the application runs
- The application needs IAM permissions to access the specified parameters
- By default, the application uses the AWS region specified in the `AWS_REGION` environment variable, or falls back to `ap-southeast-1`

#### Local Development with AWS Profiles

For local development, you can use AWS profiles to manage your credentials:

```
# Specify an AWS profile to use for credentials
AWS_PROFILE=your-profile-name
```

This allows you to use credentials from your local AWS configuration without having to set AWS access keys directly in environment variables.

### Fallback Mechanism

The server includes a fallback mechanism to in-memory storage if:

- Redis is not configured
- Redis connection fails
- Redis operations encounter errors

This ensures that the server remains functional even when Redis is unavailable, with appropriate logging to indicate the fallback.

### Session Data Storage

When Redis is configured, the server stores:

- API keys for each session
- Session metadata
- Session IDs and associations

Session data in Redis automatically expires after 24 hours of inactivity to prevent stale data accumulation.

## Logging

The Gaia MCP Server uses [Pino](https://getpino.io/) for logging, providing structured JSON logs with customizable log levels.

### Log Levels

The server supports the following log levels, in order of verbosity:

- `debug`: Detailed debugging information
- `info`: General operational information (default)
- `warn`: Warning conditions that should be addressed
- `error`: Error conditions that require attention
- `fatal`: Critical conditions that require immediate action

You can set the log level via the `LOG_LEVEL` environment variable in your `.env` file.

### Centralized Logger

The application uses a centralized logger module located at `src/utils/logger.ts`, which provides:

1. A default logger instance that can be imported anywhere in the application
2. A `createLogger` function for creating custom loggers

```typescript
// Import the default logger
import { logger } from './utils/logger';

// Use the logger
logger.info('Application started');

// Create a custom logger
import { createLogger } from './utils/logger';
const customLogger = createLogger({
  name: 'my-component',
  level: 'debug',
});
```

### Log Format

Logs are formatted using `pino-pretty` in development mode for better readability. In production, you can pipe the JSON output to any log management system that supports JSON-formatted logs.

### Custom Logger Implementation

The server supports custom logger injection. When creating a `GaiaMcpServer` instance, you can provide your own Pino logger:

```typescript
import { createLogger } from './utils/logger';
import { GaiaMcpServer } from './mcp/server';

// Create custom logger
const logger = createLogger({
  name: 'my-app',
  level: 'debug',
});

// Pass custom logger to server
const server = new GaiaMcpServer({
  apiUrl: process.env.GAIA_API_URL,
  logger: logger.child({ component: 'GaiaMcpServer' }),
});
```

### Log Context in Tools

Tool handlers receive a logger instance through the context parameter, which can be used for tool-specific logging:

```typescript
// In a tool handler
handler: async (args, context) => {
  // Get logger from context or fallback to console
  const logger = context?.logger?.child({ tool: 'my-tool' }) || console;

  logger.info('Starting tool operation', { args });

  // Tool implementation...

  logger.info('Tool operation completed');
};
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

To register new tools for the MCP server, you can also edit the `registerTools` method in `src/mcp/server.ts`.

## Docker Deployment

### Building the Docker Image

To build the Docker image for the SSE server:

```bash
docker build -t gaia-mcp-server .
```

### Running with Docker

To run the SSE server using Docker:

```bash
docker run -p 3000:3000 \
  -e MCP_SERVER_SSE_PORT=3000 \
  -e GAIA_API_URL=https://your-api-url \
  gaia-mcp-server
```

### Using Docker Compose

For easier local testing and development, you can use Docker Compose:

```bash
docker-compose up -d
```

This will build and start the SSE server with the environment variables specified in your `.env` file or using default values.

### Environment Variables

- `MCP_SERVER_SSE_PORT`: Port for the SSE server (default: 3000)
- `GAIA_API_URL`: URL for the Gaia API (default: https://artventure-api.sipher.gg)
- `REDIS_URL`: Redis connection URL for session storage
- `REDIS_KEY_PREFIX`: Prefix for Redis keys (default: gaia-mcp:sessions:)
- `LOG_LEVEL`: Logging level (debug, info, warn, error, fatal) (default: info)
- `AWS_REGION`: AWS region for SSM parameters (default: ap-southeast-1)
- `AWS_PROFILE`: AWS profile for credentials (local development only)

### Cloud Deployment

When deploying to a cloud provider:

1. Build the Docker image locally or set up CI/CD to build it
2. Push the image to a container registry (Docker Hub, AWS ECR, Google Container Registry, etc.)
3. Deploy the container to your cloud platform of choice (AWS ECS, Google Cloud Run, Azure Container Instances, etc.)
4. Set the required environment variables in your cloud platform's configuration

Example for AWS ECS:

```bash
# Build the image
docker build -t gaia-mcp-server .

# Tag the image for ECR
docker tag gaia-mcp-server:latest your-aws-account-id.dkr.ecr.your-region.amazonaws.com/gaia-mcp-server:latest

# Push to ECR
docker push your-aws-account-id.dkr.ecr.your-region.amazonaws.com/gaia-mcp-server:latest
```

Then deploy using AWS ECS console or CLI, ensuring to set the environment variables.

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
