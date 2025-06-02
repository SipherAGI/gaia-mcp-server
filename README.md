# Gaia MCP Server

An MCP (Model Context Protocol) server implementation for ProtoGaia, supporting both stdio and SSE (Server-Sent Events) communication methods.

## Table of Contents

- [Introduction](#introduction)
- [Installation](#installation)
  - [Using with npx (No Installation)](#using-with-npx-no-installation)
  - [Global Installation](#global-installation)
  - [Binary Releases](#binary-releases)
- [Usage](#usage)
  - [Integrate with Claude Desktop](#integrate-with-claude-desktop)
  - [Using Stdio Method](#using-stdio-method)
  - [Using SSE Method](#using-sse-method)
- [Understanding MCP](#understanding-mcp)
- [API Endpoints](#api-endpoints)
- [Supported Tools](#supported-tools)
- [Notice](#notice)

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

### Binary Releases

For users who prefer standalone executables or don't have Node.js installed, we provide pre-built binaries for different platforms:

1. **Download the latest binary** from the [GitHub Releases page](https://github.com/your-org/gaia-mcp-server/releases)
2. **Choose your platform**:

   - **Linux (x64)**: `gaia-mcp-server-linux-x64`
   - **macOS (Intel)**: `gaia-mcp-server-darwin-x64`
   - **macOS (Apple Silicon)**: `gaia-mcp-server-darwin-arm64`
   - **Windows (x64)**: `gaia-mcp-server-win32-x64.exe`

3. **Make the binary executable** (Linux/macOS only):

   ```bash
   chmod +x gaia-mcp-server-*
   ```

4. **Run the binary**:

   ```bash
   # Linux/macOS
   ./gaia-mcp-server-linux-x64 stdio --api-key=your-api-key
   ./gaia-mcp-server-darwin-x64 sse

   # Windows
   gaia-mcp-server-win32-x64.exe stdio --api-key=your-api-key
   ```

**Benefits of using binaries:**

- ✅ No Node.js installation required
- ✅ Self-contained executable
- ✅ Faster startup time
- ✅ Easier deployment in containerized environments

## Usage

The server can be run in two modes: stdio or SSE. You can choose which mode to run using the command-line interface.

### Integrate with Claude Desktop

You can integrate Gaia MCP Server with Claude Desktop to generate images directly in your conversations:

1. **Get Your Gaia API Key**:

   - Log in to [Gaia's website](https://protogaia.com)
   - Go to your account settings via your profile picture
   - Navigate to the "Security" section
   - Create a new API key and copy it

2. **Configure Claude Desktop**:

   - Open Claude Desktop
   - Go to Settings (File > Settings on Windows, Claude > Settings on Mac)
   - Click the "Developer" tab
   - Click the "Edit config" button
   - Replace the content with one of these configurations:

   **If you've installed the package globally**:

   ```json
   {
     "mcpServers": {
       "gaia-mcp-server": {
         "command": "gaia-mcp-server",
         "args": ["stdio", "--api-key=YOUR_GAIA_API_KEY"]
       }
     }
   }
   ```

   **If you prefer to use npx (no installation)**:

   ```json
   {
     "mcpServers": {
       "gaia-mcp-server": {
         "command": "npx",
         "args": ["gaia-mcp-server", "stdio", "--api-key=YOUR_GAIA_API_KEY"]
       }
     }
   }
   ```

   Replace `YOUR_GAIA_API_KEY` with your actual Gaia API key.

3. **Restart Claude Desktop**

4. **Test the Integration**:
   - Start a new conversation
   - Ask Claude to generate an image (e.g., "Generate an image of a sunset over mountains")
   - You should see the image appear in your conversation

For more detailed instructions and troubleshooting, see our [Claude Desktop Integration Guide](docs/claude-desktop-stdio-integration-guide.md).

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

1. Create an EventSource connection to `/sse` endpoint with your Gaia's account API Key. More information about creating your API key can be found at [here](https://protogaia.com/settings/account?tab=Security).
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

## License

Apache License 2.0

## Notice

- To utilize the generative image functionality, the user must possess GAIA credits. You can check your remaining credits and purchase more [here](https://protogaia.com/settings/account?tab=Plans).
