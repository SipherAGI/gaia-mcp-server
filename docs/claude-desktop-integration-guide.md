# Integrating Gaia MCP Server with Claude Desktop

This guide will walk you through the process of integrating the Gaia MCP Server with Claude Desktop, enabling you to use AI image generation and manipulation capabilities directly within your Claude conversations.

## Overview

The Gaia MCP Server implements the Model Context Protocol (MCP), which allows large language models like Claude to interact with external tools. By integrating with the Gaia MCP Server, Claude can generate and manipulate images through text commands.

**Server URL:** `https://gaia-mcp.sipher.gg`

## Prerequisites

1. A Claude Desktop application installed on your computer
2. A Gaia account with an API key
3. Basic familiarity with Claude Desktop settings

## Integration Steps

### 1. Obtain a Gaia API Key

Before integrating with the MCP server, you need a Gaia API key:

1. Create an account or log in at [Gaia's website](https://protogaia.com)
2. Navigate to your account settings
3. Generate a new API key
4. Copy the API key for use in the next steps

### 2. Configure Claude Desktop

1. Open Claude Desktop
2. Click on your profile picture or icon in the top-right corner
3. Select "Settings" from the dropdown menu
4. Navigate to the "Advanced" or "Experimental Features" section
5. Look for "Model Context Protocol" or "External Tools" settings

### 3. Add the Gaia MCP Server

In the MCP configuration section:

1. Click "Add New MCP Server" or similar option
2. Enter the following details:

   - **Name:** Gaia Image Generation
   - **Server URL:** `https://gaia-mcp.sipher.gg/sse?apiKey=YOUR_GAIA_API_KEY`
   - Replace `YOUR_GAIA_API_KEY` with the actual API key you obtained

3. Save the configuration

### 4. Test the Integration

To verify that the integration is working:

1. Start a new conversation with Claude
2. Type a command that would use image generation, such as:
   ```
   Generate an image of a sunset over mountains
   ```
3. Claude should recognize this as a request that can use the Gaia tools and display a message indicating it's generating an image
4. After processing, Claude will display the generated image in the conversation

## Available Tools

The Gaia MCP Server provides several tools that Claude can use:

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

## Troubleshooting

If you encounter issues with the integration:

1. **Connection Error**:

   - Verify that your API key is correct
   - Check your internet connection
   - Ensure the server URL is entered correctly

2. **Authentication Error**:

   - Your API key may have expired - generate a new one
   - Verify there are no extra spaces in the API key

3. **Claude Doesn't Use the Tools**:

   - Try being more explicit in your requests (e.g., "Please use Gaia to generate an image of...")
   - Restart the Claude Desktop application
   - Check if there are any updates available for Claude Desktop

4. **Image Generation Failed**:
   - Your prompt might be too complex or contain restricted content
   - Try a simpler prompt or different subject matter

## Additional Information

- The session will expire after 24 hours of inactivity
- Each image generation counts against your Gaia API usage limits
- For optimal results, provide detailed descriptions when requesting image generation

## Support

If you continue to experience issues with the integration:

- Visit the [Gaia support page](https://protogaia.com/support)
- Contact Claude support through the desktop application
- Check the [MCP documentation](https://modelcontextprotocol.io) for general protocol information

---

**Note**: This integration enables Claude to use Gaia's AI image generation capabilities but is subject to both Claude's and Gaia's terms of service and usage policies. Ensure your prompts comply with both services' content guidelines.
