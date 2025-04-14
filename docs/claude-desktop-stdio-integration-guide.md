# Integrating Claude Desktop with Gaia MCP Server Using stdio Mode

This guide will walk you through the process of integrating Claude Desktop with the Gaia MCP Server using stdio (Standard Input/Output) mode. This integration enables you to use AI image generation and manipulation capabilities directly within your Claude conversations while running the server locally on your machine.

## Overview

The Gaia MCP Server implements the Model Context Protocol (MCP), which allows large language models like Claude to interact with external tools. By integrating with the Gaia MCP Server in stdio mode, Claude can generate and manipulate images through text commands while maintaining local execution for enhanced privacy and control.

## Prerequisites

1. A Claude Desktop application installed on your computer
2. A Gaia account with an API key
3. [Node.js](https://nodejs.org/en/download) installed on your machine (v20 or later recommended)
   - If Node.js is not installed, see the [Node.js Installation Guide](#nodejs-installation-guide) section below
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

### 2. Install and Run the Gaia MCP Server

You have two options to install and run the Gaia MCP Server:

#### Option A: Use npx (Easiest Method)

This method lets you run the Gaia MCP Server without installing it permanently:

1. Open your terminal or command prompt
2. Run the following command:

   ```bash
   npx gaia-mcp-server stdio --api-key=YOUR_GAIA_API_KEY
   ```

3. Replace `YOUR_GAIA_API_KEY` with your actual Gaia API key
4. The server will start automatically without further setup

This is ideal for testing or occasional use.

#### Option B: Install from npm

This method installs the Gaia MCP Server globally on your system:

1. Open your terminal or command prompt
2. Install the server globally:

   ```bash
   npm install -g gaia-mcp-server
   ```

3. Run the server:

   ```bash
   gaia-mcp-server stdio --api-key=YOUR_GAIA_API_KEY
   ```

4. Replace `YOUR_GAIA_API_KEY` with your actual Gaia API key

This is ideal if you plan to use the server regularly.

### 3. Configure Claude Desktop

1. Open Claude Desktop application
2. Access Settings from the menu bar:
   - On Windows: Click on "File" → "Settings"
   - On macOS: Click on "Claude" → "Settings"
3. Navigate to the "Developer" tab
4. Click on "Edit config" button
5. A file explorer window will open showing the configuration file location
6. Open the `claude_desktop_config.json` file with any text editor
7. Replace the contents with the following configuration (or add to existing configuration):

If you installed via npm (Option B), use this configuration:

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

If you want to use npx (Option A), use this configuration:

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

8. Important: Replace `YOUR_GAIA_API_KEY` with your Gaia API key obtained in step 1

9. Save the file and close the text editor
10. Restart Claude Desktop completely
11. After restarting, verify the integration by clicking the hammer icon (🔨) within the chat input - you should see Gaia tools in the available tools list

### 4. Test the Integration

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

## Node.js Installation Guide

If you don't have Node.js installed, follow these instructions:

### Windows

1. Visit the [Node.js download page](https://nodejs.org/en/download)
2. Download the Windows Installer (.msi file) for your system (64-bit recommended)
3. Run the installer and follow the on-screen instructions
4. Accept the license agreement and keep the default installation settings
5. Click "Install" and wait for the installation to complete
6. Click "Finish" to exit the installer
7. Verify the installation by opening Command Prompt and typing:
   ```
   node --version
   npm --version
   ```
   Both commands should display version numbers if installed correctly

### macOS

#### Option 1: Using the Installer

1. Visit the [Node.js download page](https://nodejs.org/en/download)
2. Download the macOS Installer (.pkg file)
3. Run the installer and follow the on-screen instructions
4. The installer will require administrator privileges
5. Verify the installation by opening Terminal and typing:
   ```
   node --version
   npm --version
   ```

#### Option 2: Using Homebrew (Recommended)

If you have Homebrew installed:

1. Open Terminal
2. Run the following command:
   ```
   brew install node
   ```
3. Verify the installation:
   ```
   node --version
   npm --version
   ```

### Linux (Ubuntu/Debian)

1. Open Terminal
2. Update your package lists:
   ```
   sudo apt update
   ```
3. Install Node.js and npm:
   ```
   sudo apt install nodejs npm
   ```
4. Verify the installation:
   ```
   node --version
   npm --version
   ```

If you need a newer version than provided by your distribution's package manager, consider using [Node Version Manager (nvm)](https://github.com/nvm-sh/nvm).
