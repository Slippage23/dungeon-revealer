#!/bin/bash

# Publish to Docker Hub Script
# Usage: ./publish.sh <dockerhub-username> [version]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if username provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: Docker Hub username required${NC}"
    echo "Usage: ./publish.sh <dockerhub-username> [version]"
    echo "Example: ./publish.sh johndoe 2.0.0"
    exit 1
fi

DOCKERHUB_USERNAME=$1
VERSION=${2:-"latest"}
IMAGE_NAME="dungeon-revealer-manager"
FULL_IMAGE="${DOCKERHUB_USERNAME}/${IMAGE_NAME}"

echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Dungeon Revealer Manager - Publish Script   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Docker Hub Username:${NC} ${DOCKERHUB_USERNAME}"
echo -e "${GREEN}Image Name:${NC} ${IMAGE_NAME}"
echo -e "${GREEN}Version:${NC} ${VERSION}"
echo -e "${GREEN}Full Tag:${NC} ${FULL_IMAGE}:${VERSION}"
echo ""

# Confirm
read -p "Continue with publish? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Cancelled${NC}"
    exit 0
fi

# Step 1: Build
echo ""
echo -e "${BLUE}Step 1/5: Building Docker image...${NC}"
docker build -t ${FULL_IMAGE}:${VERSION} .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Build successful${NC}"
else
    echo -e "${RED}✗ Build failed${NC}"
    exit 1
fi

# Step 2: Tag as latest if not already latest
if [ "$VERSION" != "latest" ]; then
    echo ""
    echo -e "${BLUE}Step 2/5: Tagging as latest...${NC}"
    docker tag ${FULL_IMAGE}:${VERSION} ${FULL_IMAGE}:latest
    echo -e "${GREEN}✓ Tagged as latest${NC}"
else
    echo ""
    echo -e "${BLUE}Step 2/5: Skipping (already latest)${NC}"
fi

# Step 3: Test the image
echo ""
echo -e "${BLUE}Step 3/5: Running quick test...${NC}"
echo "Starting test container..."

# Create test data directory
mkdir -p test-data

docker run -d \
    --name test-dr-manager \
    -p 3099:3001 \
    -v $(pwd)/test-data:/data \
    ${FULL_IMAGE}:${VERSION} > /dev/null 2>&1

# Wait for container to start
sleep 3

# Test if it's responding
if curl -s http://localhost:3099/api/config > /dev/null; then
    echo -e "${GREEN}✓ Container is responding${NC}"
    docker stop test-dr-manager > /dev/null 2>&1
    docker rm test-dr-manager > /dev/null 2>&1
    rm -rf test-data
else
    echo -e "${RED}✗ Container test failed${NC}"
    docker logs test-dr-manager
    docker stop test-dr-manager > /dev/null 2>&1
    docker rm test-dr-manager > /dev/null 2>&1
    rm -rf test-data
    exit 1
fi

# Step 4: Login to Docker Hub
echo ""
echo -e "${BLUE}Step 4/5: Logging into Docker Hub...${NC}"
docker login

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Login successful${NC}"
else
    echo -e "${RED}✗ Login failed${NC}"
    exit 1
fi

# Step 5: Push to Docker Hub
echo ""
echo -e "${BLUE}Step 5/5: Pushing to Docker Hub...${NC}"

# Push version tag
echo "Pushing ${FULL_IMAGE}:${VERSION}..."
docker push ${FULL_IMAGE}:${VERSION}

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Pushed ${VERSION}${NC}"
else
    echo -e "${RED}✗ Push failed${NC}"
    exit 1
fi

# Push latest tag if we created it
if [ "$VERSION" != "latest" ]; then
    echo "Pushing ${FULL_IMAGE}:latest..."
    docker push ${FULL_IMAGE}:latest
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Pushed latest${NC}"
    else
        echo -e "${RED}✗ Push latest failed${NC}"
        exit 1
    fi
fi

# Success!
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║            🎉 Publish Successful! 🎉           ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Your image is now available at:${NC}"
echo -e "${BLUE}https://hub.docker.com/r/${DOCKERHUB_USERNAME}/${IMAGE_NAME}${NC}"
echo ""
echo -e "${GREEN}Unraid users can now use:${NC}"
echo -e "${YELLOW}${FULL_IMAGE}:${VERSION}${NC}"
echo ""
echo -e "${GREEN}To update the image:${NC}"
echo "  docker pull ${FULL_IMAGE}:${VERSION}"
echo ""
echo -e "${GREEN}To run locally:${NC}"
echo "  docker run -d -p 3001:3001 -v ./data:/data ${FULL_IMAGE}:${VERSION}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "  1. Update your Docker Hub repository description"
echo "  2. Create a GitHub repo (optional but recommended)"
echo "  3. Share with your Unraid community!"
echo ""
