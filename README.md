# Gaia MCP Server

An MCP (Model Context Protocol) server implementation for ProtoGaia, supporting both stdio and SSE (Server-Sent Events) communication methods.

## Table of Contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Configuration](#configuration)
- [Logging](#logging)
- [Usage](#usage)
  - [Using Stdio Method](#using-stdio-method)
  - [Using SSE Method](#using-sse-method)
- [Understanding MCP](#understanding-mcp)
- [API Endpoints](#api-endpoints)
- [Supported Tools](#supported-tools)
- [Development](#development)

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
GAIA_API_KEY='your-api-key-here'

# Logging
LOG_LEVEL='info' # debug, info, warn, error, fatal
```

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
import { logger } from "./utils/logger";

// Use the logger
logger.info("Application started");

// Create a custom logger
import { createLogger } from "./utils/logger";
const customLogger = createLogger({
  name: "my-component",
  level: "debug",
});
```

### Log Format

Logs are formatted using `pino-pretty` in development mode for better readability. In production, you can pipe the JSON output to any log management system that supports JSON-formatted logs.

### Custom Logger Implementation

The server supports custom logger injection. When creating a `GaiaMcpServer` instance, you can provide your own Pino logger:

```typescript
import { createLogger } from "./utils/logger";
import { GaiaMcpServer } from "./mcp/gaia-mcp-server";

// Create custom logger
const logger = createLogger({
  name: "my-app",
  level: "debug",
});

// Pass custom logger to server
const server = new GaiaMcpServer({
  gaia: {
    apiUrl: process.env.GAIA_API_URL,
    apiKey: process.env.GAIA_API_KEY,
  },
  logger: logger.child({ component: "GaiaMcpServer" }),
});
```

### Log Context in Tools

Tool handlers receive a logger instance through the context parameter, which can be used for tool-specific logging:

```typescript
// In a tool handler
handler: async (args, context) => {
  // Get logger from context or fallback to console
  const logger = context?.logger?.child({ tool: "my-tool" }) || console;

  logger.info("Starting tool operation", { args });

  // Tool implementation...

  logger.info("Tool operation completed");
};
```

## Usage

The server can be run in two modes: stdio or SSE.

### Using Stdio Method

The stdio method is useful for direct communication with the server via standard input/output streams, typically used when integrating with CLI tools or developing locally.

To start the server in stdio mode:

```bash
node dist/index.js
```

With this method, communication with the server happens through stdin/stdout, following the MCP protocol format.

Example of sending a message through stdio:

```json
{ "type": "message", "data": { "content": "Your message content here" } }
```

### Using SSE Method

The SSE method allows for server-sent events communication over HTTP, making it suitable for web applications.

To start the server in SSE mode:

```bash
node dist/sse.js
```

The server will start on the port specified in your .env file (default: 3000).

#### Connecting to the SSE Server

To establish an SSE connection:

1. Create an EventSource connection to `/sse` endpoint
2. Send messages via POST requests to `/messages` endpoint

Client-side JavaScript example:

```javascript
// Establish SSE connection
const eventSource = new EventSource("http://localhost:3000/sse");
const sessionId = ""; // Will be populated from the first message

// Listen for messages
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);

  // Store session ID from first message
  if (data.sessionId && !sessionId) {
    sessionId = data.sessionId;
  }

  console.log("Received:", data);
};

// Send a message
async function sendMessage(content) {
  await fetch("http://localhost:3000/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sessionId,
      message: {
        type: "message",
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

## Supported Tools

The Gaia MCP Server provides several AI image generation and manipulation tools that can be called by LLMs:

- **upload-image**: Upload images to the Gaia platform from URLs
- **create-style**: Create a new style in the Gaia platform using provided images
- **generate-image**: Generate images with Protogaia based on text prompts
- **remix**: Create new variations of an existing image
- **face-enhancer**: Enhance face details in an existing image

Each tool is registered with the MCP server and can be invoked according to the Model Context Protocol standard.

## Development

To register new tools for the MCP server, edit the `registerTools` method in `src/mcp/gaia-mcp-server.ts`.

To add new functionality:

1. Create a new tool implementation
2. Register it in the server
3. Rebuild and test

### License

ISC
