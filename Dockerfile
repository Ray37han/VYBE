# Use Node.js LTS version
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy server package files
COPY server/package*.json ./server/

# Install dependencies
WORKDIR /app/server
RUN npm install --production

# Copy server source code
COPY server/ ./

# Expose port
EXPOSE 5001

# Set environment to production
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"]
