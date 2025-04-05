# Development Guide

This document outlines the development workflow for the Gaia MCP Server.

## Available Development Scripts

For development, you have several options to run the server with automatic reloading when files change:

### Using tsc-watch (Recommended)

This will compile TypeScript and restart the server when files change:

```bash
# Run the main server in development mode
pnpm run dev

# Run the SSE server in development mode
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

## Production Build

When deploying to production, use:

```bash
# Build the production-ready code
pnpm run build

# Start the main server
pnpm run start

# Or start the SSE server
pnpm run start:sse
```

## Configuration Files

- `nodemon.json` - Contains the configuration for nodemon
- `tsconfig.json` - TypeScript configuration
