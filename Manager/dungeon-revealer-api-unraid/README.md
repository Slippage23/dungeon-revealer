# Dungeon Revealer Map Manager - Web Edition (Unraid Ready)

A web-based tool to manage maps, tokens, and monster data for [Dungeon Revealer](https://github.com/apclary/dungeon-revealer). This version is designed to run as a Docker container on Unraid or any Docker-compatible system.

## Features

- 🗺️ **View Server Maps** - Browse all maps on your Dungeon Revealer server
- 🎭 **Token Management** - View and search tokens with image previews
- 📊 **Statistics Dashboard** - Track local files and server connection status
- ⚙️ **Web-Based Configuration** - Configure via browser interface
- 📝 **Monster Data Import** - Parse Excel files and create notes (coming soon)
- 🐳 **Docker Ready** - Runs perfectly on Unraid and other Docker platforms

## Quick Start with Docker

### Option 1: Docker Compose (Recommended)

1. Clone or download this repository
2. Create a `data` directory: `mkdir -p data/Assets/{Maps,Tokens}`
3. Run: `docker-compose up -d`
4. Access the web interface at `http://localhost:3001`

### Option 2: Docker Run

```bash
docker run -d \
  --name dungeon-revealer-manager \
  -p 3001:3001 \
  -v $(pwd)/data:/data \
  dungeon-revealer-manager
```

### Option 3: Build from Source

```bash
# Build the image
docker build -t dungeon-revealer-manager .

# Run the container
docker run -d \
  --name dungeon-revealer-manager \
  -p 3001:3001 \
  -v $(pwd)/data:/data \
  dungeon-revealer-manager
```

## Unraid Installation

### Method 1: Docker Template (Recommended)

1. **Go to Unraid Docker tab** → Click "Add Container"

2. **Configure the container:**
   - **Name:** `DungeonRevealerManager`
   - **Repository:** `your-docker-hub-username/dungeon-revealer-manager:latest`
   - **Network Type:** `Bridge`
3. **Port Mappings:**

   - Container Port: `3001`
   - Host Port: `3001` (or any available port)
   - Type: `TCP`

4. **Volume Mappings:**

   - Container Path: `/data`
   - Host Path: `/mnt/user/appdata/dungeon-revealer-manager`
   - Mode: `Read/Write`

   Optional - If you have existing map/token folders:

   - Container Path: `/data/Assets/Maps`
   - Host Path: `/mnt/user/path/to/your/maps`
   - Mode: `Read/Write`

5. **Environment Variables:**

   - `NODE_ENV` = `production`
   - `PORT` = `3001`
   - `DATA_DIR` = `/data`

6. Click **Apply** and wait for the container to start

7. Access at `http://YOUR-UNRAID-IP:3001`

### Method 2: Command Line on Unraid

SSH into your Unraid server and run:

```bash
docker run -d \
  --name=DungeonRevealerManager \
  --net=bridge \
  -p 3001:3001 \
  -v /mnt/user/appdata/dungeon-revealer-manager:/data \
  -e NODE_ENV=production \
  -e PORT=3001 \
  -e DATA_DIR=/data \
  --restart unless-stopped \
  your-docker-hub-username/dungeon-revealer-manager:latest
```

## Building and Publishing Docker Image

If you want to publish this to Docker Hub for easy Unraid installation:

```bash
# Build the image
docker build -t your-dockerhub-username/dungeon-revealer-manager:latest .

# Login to Docker Hub
docker login

# Push the image
docker push your-dockerhub-username/dungeon-revealer-manager:latest
```

## Configuration

### First Time Setup

1. Open the web interface at `http://YOUR-SERVER-IP:3001`
2. Click **Settings** in the sidebar
3. Configure the following:
   - **Server URL**: Your Dungeon Revealer server URL (e.g., `http://192.168.1.100:3000`)
   - **DM Password**: Your Dungeon Revealer admin password
   - **Scan Directory**: `/data/Assets/Maps` (inside the container)
   - **Token Directory**: `/data/Assets/Tokens` (inside the container)
4. Click **Save Configuration**

### Directory Structure

The container uses the following structure in `/data`:

```
/data/
├── Assets/
│   ├── Maps/           # Place your map images here
│   ├── Tokens/         # Place your token images here
│   └── Monsters.xlsx   # Optional: Monster data spreadsheet
├── config.json         # Application configuration (auto-generated)
├── process.log         # Application logs
└── upload-checkpoint.json  # Upload progress (auto-generated)
```

### Adding Maps and Tokens

**Option 1: Direct File Access (Recommended for Unraid)**

1. Navigate to your Unraid shares
2. Go to `appdata/dungeon-revealer-manager/Assets/`
3. Copy your map images to the `Maps` folder
4. Copy your token images to the `Tokens` folder
5. Use the web interface to view and manage them

**Option 2: Volume Mapping**

Map your existing folders by modifying the docker-compose.yml or docker run command:

```yaml
volumes:
  - ./data:/data
  - /path/to/your/maps:/data/Assets/Maps:ro
  - /path/to/your/tokens:/data/Assets/Tokens:ro
```

## Usage

### Viewing Maps

1. Click **List Maps** in the sidebar
2. Click **Load Maps** button
3. Browse through your server's maps with thumbnails
4. Click **Open Map** to view in Dungeon Revealer

### Managing Tokens

1. Click **List Tokens** in the sidebar
2. Use the search box to filter by name
3. Click **Load Tokens** to fetch from server
4. View token thumbnails and information

### Dashboard

The dashboard shows:

- Number of local files in your Assets folder
- Number of maps on the Dungeon Revealer server
- Connection status to your server

## Network Configuration

### Same Network as Dungeon Revealer

If both containers are on the same Docker network:

```yaml
networks:
  - dungeon-revealer-net
```

Use the container name as the server URL: `http://dungeon-revealer:3000`

### Different Networks

Use the host IP and port: `http://192.168.1.100:3000`

## Troubleshooting

### Cannot Connect to Dungeon Revealer

1. **Check server URL**: Ensure it includes `http://` and the correct port
2. **Verify password**: DM password must be correct
3. **Network access**: Container must be able to reach the Dungeon Revealer server
4. **Check logs**: `docker logs DungeonRevealerManager`

### Maps Not Showing

1. **Verify files exist**: Check `/data/Assets/Maps` has image files
2. **Check file permissions**: Ensure container can read the files
3. **Check logs**: Look at `/data/process.log`

### Port Already in Use

Change the host port in your docker run command or docker-compose.yml:

```yaml
ports:
  - "3002:3001" # Use port 3002 on host instead
```

### Access Logs

```bash
# Container logs
docker logs DungeonRevealerManager

# Application logs
docker exec DungeonRevealerManager cat /data/process.log
```

## Updating the Container

```bash
# Pull latest image
docker pull your-dockerhub-username/dungeon-revealer-manager:latest

# Stop and remove old container
docker stop DungeonRevealerManager
docker rm DungeonRevealerManager

# Run new container (use same command as initial setup)
docker run -d --name=DungeonRevealerManager ...
```

Or with docker-compose:

```bash
docker-compose pull
docker-compose up -d
```

## Environment Variables

| Variable   | Default      | Description                    |
| ---------- | ------------ | ------------------------------ |
| `NODE_ENV` | `production` | Node environment               |
| `PORT`     | `3001`       | Port the web server listens on |
| `DATA_DIR` | `/data`      | Directory for persistent data  |

## Volumes

| Container Path        | Purpose                                         |
| --------------------- | ----------------------------------------------- |
| `/data`               | Persistent storage for config, logs, and assets |
| `/data/Assets/Maps`   | Map images (optional direct mount)              |
| `/data/Assets/Tokens` | Token images (optional direct mount)            |

## Ports

| Port   | Description          |
| ------ | -------------------- |
| `3001` | Web interface (HTTP) |

## Performance Tips

1. **Use SSD for appdata**: Store the container's data on an SSD for faster access
2. **Limit image size**: Large images (>10MB) can slow down loading
3. **Use WebP format**: Modern browsers support WebP for smaller file sizes

## Security Notes

1. **DM Password**: Stored in config.json - ensure `/data` has appropriate permissions
2. **No HTTPS**: This is a local tool - use a reverse proxy for HTTPS if needed
3. **Network access**: Restrict access to trusted networks only

## Supported File Formats

- **Maps & Tokens**: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`
- **Monster Data**: `.xlsx`, `.xls` (Excel format)

## Development

### Running Locally (without Docker)

```bash
# Install dependencies
npm install

# Run the server
npm start

# Access at http://localhost:3001
```

### Environment Variables for Development

```bash
export NODE_ENV=development
export PORT=3001
export DATA_DIR=./data
```

## Future Features

- ✅ View maps from server
- ✅ View tokens from server
- ✅ Dashboard statistics
- 🔄 Batch upload maps (in progress)
- 🔄 Batch upload tokens (in progress)
- 🔄 Monster note import (in progress)
- 📋 Delete operations
- 🎨 Custom themes

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

MIT License - see LICENSE file for details

## Credits

- Built for [Dungeon Revealer](https://github.com/apclary/dungeon-revealer) by apclary
- Designed for tabletop RPG enthusiasts
- Docker-optimized for Unraid

## Support

For issues and questions:

1. Check the troubleshooting section
2. Review application logs at `/data/process.log`
3. Check Docker logs with `docker logs DungeonRevealerManager`
4. Open an issue on GitHub

---

**Happy Gaming! 🎲🗺️**
