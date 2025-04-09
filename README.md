# Gaia MCP Server

An MCP (Model Context Protocol) server implementation for ProtoGaia, supporting both stdio and SSE (Server-Sent Events) communication methods.

## Table of Contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Configuration](#configuration)
- [Redis Integration](#redis-integration)
- [Logging](#logging)
- [Usage](#usage)
  - [Using Stdio Method](#using-stdio-method)
  - [Using SSE Method](#using-sse-method)
- [Understanding MCP](#understanding-mcp)
- [API Endpoints](#api-endpoints)
- [Supported Tools](#supported-tools)
- [Development](#development)
- [Docker Deployment](#docker-deployment)

## Introduction

This repository contains a TypeScript implementation of an MCP server for ProtoGaia. It provides a standardized way for LLMs (Large Language Models) to communicate with external tools and services using the Model Context Protocol.

## Installation

1. Clone this repository:

   ```bash
   git clone https://github.com/yourusername/gaia-mcp-server.git
   cd gaia-mcp-server
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Build the project:
   ```bash
   pnpm build
   ```

## Configuration

Create a `.env` file in the root directory with the following content:

```
# MCP Server
MCP_SERVER_SSE_PORT=3000

# Gaia API
GAIA_API_URL='https://artventure-api.sipher.gg'

# Redis Configuration (optional)
REDIS_URL='redis://username:password@host:port'
# Or use individual connection parameters
REDIS_HOST='localhost'
REDIS_PORT=6379
REDIS_PASSWORD='your-redis-password'
REDIS_KEY_PREFIX='gaia-mcp:sessions:'

# Logging
LOG_LEVEL='info' # debug, info, warn, error, fatal
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

## Usage

The server can be run in two modes: stdio or SSE. You can choose which mode to run using the command-line interface.

### Using Stdio Method

The stdio method is useful for direct communication with the server via standard input/output streams, typically used when integrating with CLI tools or developing locally.

To start the server in stdio mode:

```bash
# Build the project first
pnpm build

# Run the server in stdio mode with an API key
node dist/index.js stdio --api-key=your-api-key
```

You can also specify a custom API URL:

```bash
node dist/index.js stdio --api-key=your-api-key --api-url=https://your-custom-api-url
```

With the stdio method, communication with the server happens through stdin/stdout, following the MCP protocol format.

Example of sending a message through stdio:

```json
{ "type": "message", "data": { "content": "Your message content here" } }
```

### Using SSE Method

The SSE method allows for server-sent events communication over HTTP, making it suitable for web applications.

To start the server in SSE mode:

```bash
# Build the project first
pnpm build

# Run the server in SSE mode
node dist/index.js sse
```

The server will start on the port specified in your .env file (default: 3000).

#### Connecting to the SSE Server

To establish an SSE connection:

1. Create an EventSource connection to `/sse` endpoint with your Gaia's account API Key. More information about creating your API key can be found at [here](#).
2. Send messages via POST requests to `/messages` endpoint

Client-side JavaScript example:

```javascript
// Establish SSE connection
const eventSource = new EventSource('http://localhost:3000/sse?apiKey=your-gaia-account-api-key');
const sessionId = ''; // Will be populated from the first message

// Listen for messages
eventSource.onmessage = event => {
  const data = JSON.parse(event.data);

  // Store session ID from first message
  if (data.sessionId && !sessionId) {
    sessionId = data.sessionId;
  }

  console.log('Received:', data);
};

// Send a message
async function sendMessage(content) {
  await fetch('http://localhost:3000/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sessionId,
      message: {
        type: 'message',
        data: { content },
      },
    }),
  });
}
```

## Understanding MCP

The Model Context Protocol (MCP) is a standardized communication protocol that enables LLMs to interact with external tools and services. More information can be found at [modelcontextprotocol.io](https://modelcontextprotocol.io/introduction).

Key MCP concepts:

- **Messages**: The basic unit of communication in the protocol
- **Tools**: Functions that can be called by the model
- **Transport Layers**: Methods of communication (stdio, SSE, etc.)
- **Sessions**: Stateful interactions between the model and server

This server implementation uses the `@modelcontextprotocol/sdk` package to handle the protocol details.

## API Endpoints

When running in SSE mode, the following endpoints are available:

- `GET /sse`: Establishes an SSE connection
- `POST /messages`: Sends messages to the server
- `GET /health`: Health check endpoint
- `GET /`: Basic information about the server

## Supported Tools

The Gaia MCP Server provides several AI image generation and manipulation tools that can be called by LLMs:

- **upload-image**: Upload images to the Gaia platform from URLs
- **create-style**: Create a new style in the Gaia platform using provided images
- **generate-image**: Generate images with Protogaia based on text prompts
- **remix**: Create new variations of an existing image
- **face-enhancer**: Enhance face details in an existing image
- **upscaler**: Enhance the resolution quality of image

Each tool is registered with the MCP server and can be invoked according to the Model Context Protocol standard.

## Development

For detailed development instructions, please refer to the [DEVELOPMENT.md](DEVELOPMENT.md) document.

This document includes:

- Available development scripts with watch mode
- Development workflow options
- Production build instructions
- Configuration details

To register new tools for the MCP server, edit the `registerTools` method in `src/mcp/server.ts`.

To add new functionality:

1. Create a new tool implementation in the `src/mcp/tools` directory
2. Register it in the `tools` array in `src/mcp/tools/index.ts`
3. Rebuild and test

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

### License

ISC
