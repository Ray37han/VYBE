# Use Node.js LTS version
FROM node:18-alpine

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app/server

# Copy package files first (for better caching)
COPY server/package*.json ./

# Install dependencies (use npm install since we have package-lock.json)
RUN npm install --production --ignore-scripts || npm install --production

# Copy server source code
COPY server/ ./

# Expose port
EXPOSE 5001

# Set environment to production
ENV NODE_ENV=production

# Start the application
CMD ["node", "server.js"]
