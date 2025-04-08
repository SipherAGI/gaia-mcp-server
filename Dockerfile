# Build stage
FROM node:20-alpine AS build

# Install pnpm
RUN npm install -g pnpm@10.2.0

# Set working directory
WORKDIR /app

# Copy package.json
COPY package.json ./

# Install dependencies with --ignore-scripts to skip husky
RUN pnpm install --ignore-scripts

# Copy source code
COPY tsconfig.json ./
COPY src/ ./src/

# Build the application
RUN pnpm run build

# Runtime stage
FROM node:20-alpine AS runtime

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@10.2.0

# Copy package.json
COPY package.json ./

# Copy the generated lock file from build stage
COPY --from=build /app/pnpm-lock.yaml ./

# Install only production dependencies
RUN pnpm install --prod --ignore-scripts

# Copy build artifacts from the build stage
COPY --from=build /app/dist ./dist

# Set environment variables with defaults
ENV MCP_SERVER_SSE_PORT=3000
ENV GAIA_API_URL=https://artventure-api.sipher.gg
ENV LOG_LEVEL=info
ENV AWS_REGION=ap-southeast-1

# Expose the SSE port
EXPOSE ${MCP_SERVER_SSE_PORT}

# Run the SSE server
CMD ["node", "dist/sse.js"]