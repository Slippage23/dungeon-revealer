#!/bin/sh
set -e

echo "Starting Dungeon Revealer Map Manager..."
echo "Node version: $(node --version)"
echo "Working directory: $(pwd)"
echo "Data directory: $DATA_DIR"

# Ensure data directories exist
mkdir -p /data/Assets/Maps /data/Assets/Tokens

# Start the server
exec node /app/server.js
