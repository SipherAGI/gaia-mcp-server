# Gaia MCP Server

An MCP (Model Context Protocol) server implementation for ProtoGaia, supporting both stdio and SSE (Server-Sent Events) communication methods.

## Table of Contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Usage](#usage)
  - [Using Stdio Method](#using-stdio-method)
  - [Using SSE Method](#using-sse-method)
- [Understanding MCP](#understanding-mcp)
- [API Endpoints](#api-endpoints)
- [Supported Tools](#supported-tools)

## Introduction

This package contains a TypeScript implementation of an MCP server for ProtoGaia. It provides a standardized way for LLMs (Large Language Models) to communicate with external tools and services using the Model Context Protocol.

## Installation

You can use Gaia MCP Server in multiple ways:

### Using with npx (No Installation)

Run the server directly using npx without installing:

```bash
# Run in SSE mode
npx @ather-mcp/gaia-mcp-server sse

# Run in stdio mode
npx @ather-mcp/gaia-mcp-server stdio --api-key=your-api-key
```

### Global Installation

Install the package globally to run from anywhere:

```bash
npm install -g @ather-mcp/gaia-mcp-server
```

Then run it from any terminal:

```bash
# Run in SSE mode
gaia-mcp-server sse

# Run in stdio mode
gaia-mcp-server stdio --api-key=your-api-key
```

## Usage

The server can be run in two modes: stdio or SSE. You can choose which mode to run using the command-line interface.

### Using Stdio Method

The stdio method is useful for direct communication with the server via standard input/output streams, typically used when integrating with CLI tools or developing locally.

To start the server in stdio mode:

```bash
# Using npx
npx @ather-mcp/gaia-mcp-server stdio --api-key=your-api-key

# Using globally installed package
gaia-mcp-server stdio --api-key=your-api-key
```

You can also specify a custom API URL:

```bash
npx @ather-mcp/gaia-mcp-server stdio --api-key=your-api-key --api-url=https://your-custom-api-url
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
# Using npx
npx @ather-mcp/gaia-mcp-server sse

# Using globally installed package
gaia-mcp-server sse
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

### License

ISC
