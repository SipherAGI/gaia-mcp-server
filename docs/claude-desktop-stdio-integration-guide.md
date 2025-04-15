# Getting Started with Claude Desktop and Gaia Image Generation

This guide will help you set up Claude Desktop to generate images using Gaia. By following these steps, you'll be able to ask Claude to create and edit images directly in your conversations.

## What You'll Be Able to Do

Once set up, you can ask Claude to:

- Create brand new images based on your descriptions
- Edit and enhance photos
- Improve image resolution
- And more!

## What You Need Before Starting

1. Claude Desktop app installed on your computer
2. A Gaia account (you'll need to create one if you don't have it already)
3. Node.js installed on your computer (instructions included below if you need to install it)
4. Basic knowledge of how to use your computer's command line/terminal

## How This Works (In Simple Terms)

This setup allows Claude to talk to a small program (called Gaia MCP Server) that runs on your computer. This program helps Claude generate images locally on your machine, which means:

- Better privacy - your image requests stay on your computer
- More reliability - works even when some internet services are down
- More control - you can adjust settings if needed

## Setting Up Step-by-Step

### Step 1: Get Your Gaia API Key

An API key is like a special password that lets Claude use Gaia's image tools:

1. Go to [Gaia's website](https://protogaia.com) and create an account or log in
2. Click on your profile picture in the top-right corner
3. Select "My Account"
4. Go to the "Security" section
5. Look for "API Key" and create a new one
6. Copy this key - you'll need it in later steps

### Step 2: Set Up the Gaia MCP Server

You have two ways to set this up - choose the one that sounds easier to you:

#### Option A: Quick Setup

This method runs the server only when you need it, without installing anything permanently:

- You don't need to do anything else right now - just move to Step 3

#### Option B: Permanent Installation (Recommended)

This method installs the server permanently on your computer (better if you plan to use it often):

1. Open your computer's terminal/command prompt
   - On Windows: Search for "Command Prompt" in the Start menu
   - On Mac: Search for "Terminal" in Spotlight (press Cmd+Space)
2. Type this command and press Enter:

   ```
   npm install -g @ather-mcp/gaia-mcp-server
   ```

3. To check if it installed correctly, type this command and press Enter:

   ```
   gaia-mcp-server --version
   ```

   You should see a version number appear.

### Step 3: Connect Claude Desktop to Gaia

1. Open the Claude Desktop app
2. Find Settings:
   - On Windows: Click "File" then "Settings"
   - On Mac: Click "Claude" then "Settings"
3. Click the "Developer" tab
4. Click the "Edit config" button
5. A file will open - you'll need to edit it

6. Replace everything in the file with one of these options:

   If you chose Option B (permanent installation), use:

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

   If you chose Option A (quick setup), use:

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

7. **IMPORTANT**: Replace `YOUR_GAIA_API_KEY` with the actual API key you copied in Step 1

8. Save the file and close the text editor
9. Completely close and restart Claude Desktop
10. To check if everything's working, look for a hammer icon (🔨) in the chat input area - clicking it should show Gaia tools in the list

### Step 4: Try It Out!

1. Start a new conversation with Claude
2. Try asking for an image with a message like:
   ```
   Generate an image of a sunset over mountains
   ```
3. Claude should tell you it's generating an image
4. After a short wait, you should see the image appear in your conversation

## Fun Image Prompts to Try

Here are some examples you can copy and paste to test your setup:

- "Generate an image of a futuristic city with flying cars"
- "Create a picture of a cute cartoon penguin on a snowboard"
- "Make an image of a tropical beach at sunset"
- "Generate a picture of a magical forest with glowing mushrooms"

If you upload an image to Claude, you can also try:

- "Enhance the faces in this photo"
- "Make this image higher resolution"

## Troubleshooting: Common Problems and Solutions

### If Claude Can't Start the Image Server

1. **Check your settings**:

   - Make sure your API key is typed correctly in the configuration file
   - Make sure there are no extra spaces or typos

2. **Try restarting**:

   - Close Claude Desktop completely and reopen it

3. **Check if Node.js is working**:
   - Open terminal/command prompt
   - Type `node --version` and press Enter
   - You should see a version number (if not, see the Node.js installation guide below)

### If Claude Isn't Creating Images

1. Try being more specific in your requests:

   - "Please use Gaia to generate an image of a sunset"
   - "Can you create an image of a cat using the image generation tool?"

2. Restart Claude Desktop

3. Check if there are any updates available for Claude Desktop

## Getting Help

If you're still having trouble:

- Visit [Gaia's support page](https://protogaia.com/)
- Contact Claude support through the desktop app
- Ask a friend who's familiar with technology to help you

---

## Node.js Installation Guide (If Needed)

If you don't have Node.js installed, follow these simple instructions:

### For Windows

1. Go to the [Node.js download page](https://nodejs.org/en/download)
2. Click the Windows Installer (.msi) button (64-bit recommended)
3. Once downloaded, double-click the file to start installation
4. Follow the on-screen prompts, leaving all settings at their defaults
5. Click "Install" and wait for it to finish
6. To verify it worked, open Command Prompt (search for it in the Start menu) and type:
   ```
   node --version
   ```
   If you see a version number, it worked!

### For Mac

1. Go to the [Node.js download page](https://nodejs.org/en/download)
2. Click the macOS Installer (.pkg) button
3. Once downloaded, double-click the file to start installation
4. Follow the on-screen instructions (you'll need your admin password)
5. To verify it worked, open Terminal (search for "Terminal" in Spotlight) and type:
   ```
   node --version
   ```
   If you see a version number, it worked!

### For Mac Users with Homebrew

If you already use Homebrew (a package manager for Mac):

1. Open Terminal
2. Type this command and press Enter:
   ```
   brew install node
   ```
3. To verify it worked, type:
   ```
   node --version
   ```

### For Linux (Ubuntu/Debian)

1. Open Terminal
2. Update your system's package list:
   ```
   sudo apt update
   ```
3. Install Node.js:
   ```
   sudo apt install nodejs npm
   ```
4. To verify it worked, type:
   ```
   node --version
   ```

---

**Note**: When using these image generation tools, please respect both Claude's and Gaia's terms of service. Don't create inappropriate or harmful images.
