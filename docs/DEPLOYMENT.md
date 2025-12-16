# Deployment Guide

## Docker Deployment

### Quick Start

```bash
# Pull and run
docker pull slippage/dungeon-revealer:latest
docker run -d \
  -p 3000:3000 \
  -e DM_PASSWORD=your_dm_password \
  -e PC_PASSWORD=your_player_password \
  -v /path/to/data:/usr/src/app/data \
  slippage/dungeon-revealer:latest
```

### Docker Compose

```yaml
version: "3.8"
services:
  dungeon-revealer:
    image: slippage/dungeon-revealer:latest
    container_name: dungeon-revealer
    ports:
      - "3000:3000"
    environment:
      - DM_PASSWORD=your_dm_password
      - PC_PASSWORD=your_player_password
    volumes:
      - ./data:/usr/src/app/data
    restart: unless-stopped
```

### Available Tags

| Tag      | Description                |
| -------- | -------------------------- |
| `latest` | Most recent stable release |
| `1.17.1` | Specific version           |

### Volume Mounts

| Container Path      | Purpose                          |
| ------------------- | -------------------------------- |
| `/usr/src/app/data` | Maps, tokens, database, settings |

### Environment Variables

| Variable      | Required | Description                                 |
| ------------- | -------- | ------------------------------------------- |
| `DM_PASSWORD` | No       | Password for DM access (unset = public)     |
| `PC_PASSWORD` | No       | Password for player access (unset = public) |
| `PORT`        | No       | Override default port 3000                  |

---

## Unraid Deployment

### Community Applications

1. Open **Community Applications** in Unraid
2. Search for "Dungeon Revealer"
3. Click Install
4. Configure:
   - **Container Port**: 3000
   - **Host Port**: Your preferred port
   - **DM_PASSWORD**: Your DM password
   - **PC_PASSWORD**: Your player password
   - **Data Path**: `/mnt/user/appdata/dungeon-revealer`

### Manual Template

```xml
<?xml version="1.0"?>
<Container version="2">
  <Name>dungeon-revealer</Name>
  <Repository>slippage/dungeon-revealer:latest</Repository>
  <Network>bridge</Network>
  <Privileged>false</Privileged>
  <Config Name="Web UI" Target="3000" Default="3000" Mode="tcp" Type="Port"/>
  <Config Name="DM Password" Target="DM_PASSWORD" Default="" Type="Variable"/>
  <Config Name="PC Password" Target="PC_PASSWORD" Default="" Type="Variable"/>
  <Config Name="Data" Target="/usr/src/app/data" Default="/mnt/user/appdata/dungeon-revealer" Type="Path"/>
</Container>
```

---

## Building from Source

### Prerequisites

- Node.js 16+
- npm 8+

### Build Steps

```bash
git clone https://github.com/dungeon-revealer/dungeon-revealer.git
cd dungeon-revealer
npm install
npm run build
```

### Run Production Build

```bash
NODE_ENV=production node server-build/index.js
```

### Build Docker Image Locally

```bash
docker build -t dungeon-revealer:local .
docker run -p 3000:3000 dungeon-revealer:local
```

---

## Reverse Proxy Configuration

### Nginx

```nginx
server {
    listen 80;
    server_name dungeon.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Traefik (Docker Labels)

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.dungeon.rule=Host(`dungeon.yourdomain.com`)"
  - "traefik.http.services.dungeon.loadbalancer.server.port=3000"
```

### Caddy

```
dungeon.yourdomain.com {
    reverse_proxy localhost:3000
}
```

---

## SSL/HTTPS

### With Reverse Proxy (Recommended)

Configure SSL termination at your reverse proxy (nginx, traefik, caddy) and proxy to the container over HTTP.

### Direct SSL (Not Recommended)

Dungeon Revealer doesn't natively support HTTPS. Use a reverse proxy for SSL termination.

---

## Backup & Restore

### Backup

```bash
# Stop container
docker stop dungeon-revealer

# Backup data directory
tar -czvf dungeon-revealer-backup.tar.gz /path/to/data

# Restart container
docker start dungeon-revealer
```

### Restore

```bash
# Stop container
docker stop dungeon-revealer

# Restore data
tar -xzvf dungeon-revealer-backup.tar.gz -C /path/to/data

# Restart container
docker start dungeon-revealer
```

### Important Files

| File             | Purpose                   |
| ---------------- | ------------------------- |
| `data/db.sqlite` | All application data      |
| `data/maps/`     | Uploaded map images       |
| `data/files/`    | Uploaded tokens and media |

---

## Troubleshooting

### Container won't start

- Check logs: `docker logs dungeon-revealer`
- Verify port isn't in use: `netstat -tlnp | grep 3000`
- Ensure data directory permissions allow container access

### Can't connect to server

- Verify container is running: `docker ps`
- Check firewall rules for port 3000
- Test locally first: `curl http://localhost:3000`

### WebSocket errors

- Ensure reverse proxy supports WebSocket upgrades
- Check `Upgrade` and `Connection` headers are passed through

### Data not persisting

- Verify volume mount is correct
- Check container has write permissions to mounted directory
- Use absolute paths for volume mounts
