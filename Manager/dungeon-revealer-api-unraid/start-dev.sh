#!/bin/bash

# Development startup script

echo "🎲 Starting Dungeon Revealer Map Manager (Development Mode)"
echo "=================================================="

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Create data directories if they don't exist
if [ ! -d "data/Assets/Maps" ]; then
    echo "📁 Creating data directories..."
    mkdir -p data/Assets/{Maps,Tokens}
fi

# Set environment variables
export NODE_ENV=development
export PORT=3001
export DATA_DIR=./data

echo ""
echo "✅ Ready to start!"
echo "📍 Server will run at: http://localhost:3001"
echo "📁 Data directory: ./data"
echo ""
echo "Starting server..."
echo ""

# Start the server
npm start
