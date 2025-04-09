# Integrating Claude Desktop with Gaia MCP Server Using stdio Mode

This guide will walk you through the process of integrating Claude Desktop with the Gaia MCP Server using stdio (Standard Input/Output) mode. This integration enables you to use AI image generation and manipulation capabilities directly within your Claude conversations while running the server locally on your machine.

## Overview

The Gaia MCP Server implements the Model Context Protocol (MCP), which allows large language models like Claude to interact with external tools. By integrating with the Gaia MCP Server in stdio mode, Claude can generate and manipulate images through text commands while maintaining local execution for enhanced privacy and control.

## Prerequisites

1. A Claude Desktop application installed on your computer
2. A Gaia account with an API key
3. Node.js installed on your machine (v16 or later recommended)
4. Basic familiarity with terminal/command prompt operations

## What is stdio Mode?

stdio (Standard Input/Output) mode allows Claude Desktop to communicate with a locally running instance of the Gaia MCP Server through standard input/output streams. This differs from SSE (Server-Sent Events) integration in several ways:

- **Local Execution**: The server runs on your local machine instead of connecting to a remote server
- **Enhanced Privacy**: Your requests and images are processed through your local connection
- **Reduced Dependency**: Works even when the cloud server might be unavailable
- **More Control**: You can modify server configurations or even the code if needed

## Step-by-Step Integration Guide

### 1. Obtain a Gaia API Key

Before setting up the local server, you need a Gaia API key:

1. Create an account or log in at [Gaia's website](https://protogaia.com)
2. Click on your profile picture in the top-right corner
3. Select "My Account" from the dropdown menu
4. Navigate to the "Security" section
5. Look for "API Key" and create a new API Key
6. Copy the key for use in the next steps

### 2. Install the Gaia MCP Server

1. Open your terminal or command prompt
2. Clone the Gaia MCP Server repository:

   ```bash
   git clone https://github.com/AtherlabsInc/gaia-mcp-server.git
   cd gaia-mcp-server
   ```

3. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

4. Build the project:
   ```bash
   npm run build
   # or
   yarn build
   # or
   pnpm build
   ```

### 3. Configure Claude Desktop

1. Open Claude Desktop
2. Click on your profile picture or icon in the top-right corner
3. Select "Settings" from the dropdown menu
4. Navigate to the "Extensions" section
5. Click on "Add new extension"

### 4. Add the Gaia MCP Server as a stdio Tool

In the Extensions configuration section:

1. Click "Add New Extension"
2. Select "Model Context Protocol (MCP)" as the extension type
3. Select "stdio" as the connection type
4. Enter the following details:

   - **Name:** Gaia Image Generation (Local)
   - **Path to Application:** Full path to the node executable
     - macOS/Linux Example: `/usr/local/bin/node` or `/usr/bin/node`
     - Windows Example: `C:\Program Files\nodejs\node.exe`
   - **Arguments:**
     ```
     "/path/to/gaia-mcp-server/dist/index.js" stdio --api-key=YOUR_GAIA_API_KEY
     ```
     (Replace `/path/to/gaia-mcp-server` with the actual path to the server directory and `YOUR_GAIA_API_KEY` with your actual API key)
   - **Working Directory:** Full path to the gaia-mcp-server project folder
     - macOS/Linux Example: `/home/username/gaia-mcp-server`
     - Windows Example: `C:\Users\username\gaia-mcp-server`

5. Click "Add Extension" to save the configuration

### 5. Test the Integration

1. Start a new conversation with Claude
2. When you first make a request that might use image generation, Claude may automatically start the Gaia MCP Server process
3. Type a prompt that would use image generation, such as:
   ```
   Generate an image of a sunset over mountains
   ```
4. Claude should recognize this as a request that can use the Gaia tools and display a message indicating it's generating an image
5. After processing, Claude will display the generated image in the conversation

## Available Tools

When connected to the Gaia MCP Server in stdio mode, Claude can use the following tools:

1. **upload-image**: Upload images to the Gaia platform from URLs
2. **create-style**: Create a new style using provided images
3. **generate-image**: Generate images based on text prompts
4. **remix**: Create variations of an existing image
5. **face-enhancer**: Enhance face details in an image
6. **upscaler**: Enhance the resolution quality of an image

## Example Prompts

Here are some example prompts you can use to test the integration:

- "Generate an image of a futuristic city with flying cars"
- "Create a photorealistic portrait of a young woman with blonde hair"
- "Draw a cute cartoon penguin on a snowboard"
- "Generate an image of a tropical beach at sunset"
- "Take this image and enhance the faces in it" (when sharing an image with Claude)
- "Upscale this image to a higher resolution" (when sharing an image with Claude)

## Troubleshooting

### Server Not Starting

If Claude is unable to start the Gaia MCP Server:

1. **Check your command arguments**:

   - Verify that the Path to Application points to the correct Node.js executable
   - Ensure the Arguments field correctly points to the index.js file and includes the stdio command
   - Make sure the API key is correctly specified in the Arguments field
   - Ensure the Working Directory is set correctly

2. **File permissions**:

   - Ensure the script has execution permissions
   - On macOS/Linux, run: `chmod +x /path/to/dist/index.js`

3. **Test running the command manually**:

   - Open a terminal and navigate to your gaia-mcp-server directory
   - Run: `node dist/index.js stdio --api-key=YOUR_GAIA_API_KEY`
   - Check if any errors are displayed

4. **Check logs**:
   - Look at Claude Desktop logs for error messages
   - Check the console output in the terminal if you're running the server manually

### Claude Doesn't Use the Tools

If Claude isn't using the Gaia tools:

1. Try being more explicit in your requests:

   - "Please use Gaia to generate an image of a sunset over mountains"
   - "Can you create an image using the generate-image tool?"

2. Restart the Claude Desktop application

3. Check if there are any updates available for Claude Desktop

4. Verify the server is running properly by testing it manually:
   ```bash
   cd /path/to/gaia-mcp-server
   node dist/index.js stdio --api-key=YOUR_GAIA_API_KEY
   ```

### Image Generation Issues

If image generation fails or produces unexpected results:

1. Your prompt might be too complex or contain restricted content
2. Try a simpler prompt or different subject matter
3. Check that your Gaia API key is valid and has not expired
4. Verify your internet connection is stable

## Advanced Configuration

### Custom API URL

You can specify a custom API URL when starting the server:

```bash
node dist/index.js stdio --api-key=YOUR_GAIA_API_KEY --api-url=https://your-custom-api-url
```

Add this to the Arguments field in Claude Desktop's extension configuration.

### Running the Server Manually

For debugging purposes, you can run the server manually in a terminal:

```bash
cd /path/to/gaia-mcp-server
node dist/index.js stdio --api-key=YOUR_GAIA_API_KEY
```

This will start the server in stdio mode, and you can observe the logs directly in the terminal.

## Benefits of stdio Mode

- **Privacy**: Your requests don't go through an external server
- **Reliability**: Less dependent on external service availability
- **Customization**: You can modify the server code or configuration
- **Performance**: Local execution can be faster in some cases
- **Control**: You have full control over the server process

## Support

If you continue to experience issues with the integration:

- Visit the [Gaia support page](https://protogaia.com/support)
- Contact Claude support through the desktop application
- Check the [MCP documentation](https://modelcontextprotocol.io) for general protocol information

---

**Note**: This integration enables Claude to use Gaia's AI image generation capabilities but is subject to both Claude's and Gaia's terms of service and usage policies. Ensure your prompts comply with both services' content guidelines.
