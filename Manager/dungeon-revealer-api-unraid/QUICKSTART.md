# Quick Start Guide

## For Unraid Users

### Step 1: Install the Container

1. Open Unraid WebUI
2. Go to **Docker** tab
3. Click **Add Container**
4. Fill in the following:

   ```
   Name: DungeonRevealerManager
   Repository: Leave empty for now (you'll build it)
   Network Type: Bridge

   Port Mapping:
   - Host Port: 3001
   - Container Port: 3001

   Volume Mapping:
   - Host Path: /mnt/user/appdata/dungeon-revealer-manager
   - Container Path: /data
   ```

5. Click **Apply**

### Step 2: Build the Docker Image

Since this isn't published to Docker Hub yet, you'll need to build it:

1. SSH into your Unraid server
2. Navigate to where you've placed these files
3. Run: `docker build -t dungeon-revealer-manager .`
4. Wait for the build to complete

### Step 3: Access the Web Interface

1. Open your browser
2. Go to: `http://YOUR-UNRAID-IP:3001`
3. You should see the Dungeon Revealer Map Manager interface

### Step 4: Configure

1. Click **Settings** in the sidebar
2. Enter your Dungeon Revealer details:
   - Server URL: `http://YOUR-DUNGEON-REVEALER-IP:3000`
   - DM Password: Your admin password
   - Keep the default paths: `/data/Assets/Maps` and `/data/Assets/Tokens`
3. Click **Save Configuration**

### Step 5: Add Your Assets

1. Go to your Unraid shares
2. Navigate to: `appdata/dungeon-revealer-manager/Assets/`
3. Create folders: `Maps` and `Tokens` (if they don't exist)
4. Copy your map images to the `Maps` folder
5. Copy your token images to the `Tokens` folder

### Step 6: Start Using

- Click **List Maps** to view maps from your Dungeon Revealer server
- Click **List Tokens** to browse tokens
- Use the **Dashboard** to see statistics

## For Docker Users (Non-Unraid)

### Using Docker Compose (Easiest)

```bash
# 1. Clone or download this repository
cd dungeon-revealer-api-unraid

# 2. Create data directories
mkdir -p data/Assets/{Maps,Tokens}

# 3. Start the container
docker-compose up -d

# 4. Access the interface
open http://localhost:3001
```

### Using Docker Run

```bash
# 1. Build the image
docker build -t dungeon-revealer-manager .

# 2. Create data directory
mkdir -p $(pwd)/data/Assets/{Maps,Tokens}

# 3. Run the container
docker run -d \
  --name dungeon-revealer-manager \
  -p 3001:3001 \
  -v $(pwd)/data:/data \
  dungeon-revealer-manager

# 4. Access the interface
open http://localhost:3001
```

## Testing Without Docker

```bash
# 1. Install dependencies
npm install

# 2. Create data directories
mkdir -p data/Assets/{Maps,Tokens}

# 3. Run the server
npm start

# 4. Access the interface
open http://localhost:3001
```

## Troubleshooting

### Container won't start

```bash
# Check logs
docker logs DungeonRevealerManager

# Check if port is in use
netstat -tulpn | grep 3001
```

### Can't connect to Dungeon Revealer

1. Make sure Dungeon Revealer is running
2. Verify the server URL includes `http://` and port
3. Check that both containers can communicate

### No maps showing

1. Check that files exist in `/data/Assets/Maps`
2. Verify file permissions
3. Look at `/data/process.log` for errors

## Next Steps

1. **Upload Maps** (coming soon) - Batch upload functionality
2. **Import Monster Notes** (coming soon) - Link Excel data to tokens
3. **Browse and Manage** - Use the current features to view your content

## Getting Help

1. Check the main README.md for detailed documentation
2. Review `/data/process.log` for application logs
3. Run `docker logs DungeonRevealerManager` for container logs

Happy gaming! 🎲
