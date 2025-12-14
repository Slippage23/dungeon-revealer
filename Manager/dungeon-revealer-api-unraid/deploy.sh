#!/bin/bash

# Build and Deploy Script for Dungeon Revealer Map Manager

echo "🎲 Dungeon Revealer Map Manager - Build & Deploy"
echo "================================================"
echo ""

# Function to build Docker image
build_image() {
    echo "📦 Building Docker image..."
    docker build -t dungeon-revealer-manager:latest .
    
    if [ $? -eq 0 ]; then
        echo "✅ Docker image built successfully!"
        echo ""
    else
        echo "❌ Failed to build Docker image"
        exit 1
    fi
}

# Function to create data directory
setup_data() {
    echo "📁 Setting up data directories..."
    mkdir -p data/Assets/{Maps,Tokens}
    echo "✅ Data directories created"
    echo ""
}

# Function to start container
start_container() {
    echo "🚀 Starting container..."
    
    # Check if container already exists
    if [ "$(docker ps -aq -f name=dungeon-revealer-manager)" ]; then
        echo "⚠️  Container already exists. Stopping and removing..."
        docker stop dungeon-revealer-manager
        docker rm dungeon-revealer-manager
    fi
    
    # Start new container
    docker run -d \
        --name dungeon-revealer-manager \
        --restart unless-stopped \
        -p 3001:3001 \
        -v "$(pwd)/data:/data" \
        dungeon-revealer-manager:latest
    
    if [ $? -eq 0 ]; then
        echo "✅ Container started successfully!"
        echo ""
        echo "📍 Access the application at: http://localhost:3001"
        echo "📁 Data directory: $(pwd)/data"
        echo ""
        echo "Useful commands:"
        echo "  - View logs: docker logs -f dungeon-revealer-manager"
        echo "  - Stop: docker stop dungeon-revealer-manager"
        echo "  - Restart: docker restart dungeon-revealer-manager"
        echo ""
    else
        echo "❌ Failed to start container"
        exit 1
    fi
}

# Function to stop container
stop_container() {
    echo "🛑 Stopping container..."
    docker stop dungeon-revealer-manager
    echo "✅ Container stopped"
}

# Function to view logs
view_logs() {
    echo "📋 Viewing logs (Ctrl+C to exit)..."
    docker logs -f dungeon-revealer-manager
}

# Function to show status
show_status() {
    echo "📊 Container Status:"
    echo ""
    docker ps -a --filter name=dungeon-revealer-manager --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    echo ""
    
    if [ -f "data/config.json" ]; then
        echo "📁 Configuration found at: $(pwd)/data/config.json"
    else
        echo "⚠️  No configuration file yet. Configure via web interface."
    fi
    echo ""
}

# Main menu
case "$1" in
    build)
        build_image
        ;;
    setup)
        setup_data
        ;;
    start)
        build_image
        setup_data
        start_container
        ;;
    stop)
        stop_container
        ;;
    restart)
        docker restart dungeon-revealer-manager
        echo "✅ Container restarted"
        ;;
    logs)
        view_logs
        ;;
    status)
        show_status
        ;;
    clean)
        echo "🧹 Cleaning up..."
        docker stop dungeon-revealer-manager 2>/dev/null
        docker rm dungeon-revealer-manager 2>/dev/null
        docker rmi dungeon-revealer-manager:latest 2>/dev/null
        echo "✅ Cleanup complete"
        ;;
    *)
        echo "Usage: $0 {build|setup|start|stop|restart|logs|status|clean}"
        echo ""
        echo "Commands:"
        echo "  build   - Build the Docker image"
        echo "  setup   - Create data directories"
        echo "  start   - Build, setup, and start container"
        echo "  stop    - Stop the container"
        echo "  restart - Restart the container"
        echo "  logs    - View container logs"
        echo "  status  - Show container status"
        echo "  clean   - Remove container and image"
        echo ""
        echo "Quick start: $0 start"
        exit 1
        ;;
esac
