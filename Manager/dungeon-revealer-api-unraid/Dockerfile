# Dockerfile for Dungeon Revealer Map Manager
# Optimized for Unraid deployment

FROM alpine:3.18

# Install Node.js and npm
RUN apk add --no-cache nodejs npm

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --only=production && \
    npm cache clean --force

# Copy application files
COPY server.js ./
COPY public ./public

# Create volume mount point
# Note: Actual directories created by application on first run
VOLUME ["/data"]

# Expose application port
EXPOSE 3001

# Environment variables
ENV NODE_ENV=production \
    PORT=3001 \
    DATA_DIR=/data

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/config || exit 1

# Run application (shell form to avoid permission issues)
CMD node server.js
