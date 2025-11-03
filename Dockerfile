# Use Node.js LTS version
FROM node:18-alpine

# Set working directory
WORKDIR /app/server

# Copy package files first (for better caching)
COPY server/package*.json ./

# Install dependencies
RUN npm ci --production --ignore-scripts

# Copy server source code
COPY server/ ./

# Expose port
EXPOSE 5001

# Set environment to production
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5001/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "server.js"]
