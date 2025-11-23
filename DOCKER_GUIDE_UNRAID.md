# Dungeon Revealer Docker Guide - Unraid Deployment

**Version:** v1.17.1-phase2  
**Release Date:** November 23, 2025  
**Docker Image:** `dungeon-revealer:v1.17.1-phase2` / `dungeon-revealer:latest`  
**Image Size:** 501 MB (compressed, ~1.2 GB uncompressed)

---

## ✅ Docker Image Ready for Production

The Docker image has been successfully built and is ready for deployment to Unraid!

### Image Details

```
Repository: dungeon-revealer
Tags:
  - v1.17.1-phase2 (specific release)
  - latest (points to v1.17.1-phase2)

Base Image: node:16-slim (optimized for production)
Port:       3000 (GraphQL API + WebSocket)
Entry:      node server-build/index.js

Size:       501 MB compressed
Built:      November 23, 2025
```

---

## 🚀 Deploy to Unraid

### Step 1: Add Docker Repository (if needed)

In Unraid, go to **Settings → Docker** and ensure the repository is set to:

```
https://registry-1.docker.io
```

### Step 2: Create Container from Image

#### Option A: Via Terminal (Easiest)

```bash
docker run -d \
  --name=dungeon-revealer \
  -p 3000:3000 \
  -e DM_PASSWORD=your-secure-dm-password \
  -e PC_PASSWORD=your-secure-player-password \
  -e NODE_ENV=production \
  -v /mnt/user/appdata/dungeon-revealer/data:/usr/src/app/data \
  dungeon-revealer:v1.17.1-phase2
```

#### Option B: Via Unraid Web UI

1. Go to **Docker** tab
2. Click **"Add Container"**
3. Select **Image:** `dungeon-revealer:v1.17.1-phase2`
4. Set **Container Name:** `dungeon-revealer`
5. Add **Port Mappings:**

   - Container Port: `3000`
   - Host Port: `3000`
   - Type: `TCP`

6. Add **Environment Variables:**

   - `DM_PASSWORD` = your-secure-password
   - `PC_PASSWORD` = your-player-password
   - `NODE_ENV` = `production`

7. Add **Volume Mappings:**

   - Container Path: `/usr/src/app/data`
   - Host Path: `/mnt/user/appdata/dungeon-revealer/data`
   - Access Mode: `Read/Write`

8. Click **Apply** and start container

### Step 3: Verify Container is Running

```bash
docker ps | grep dungeon-revealer
```

You should see the container running. Check logs with:

```bash
docker logs -f dungeon-revealer
```

### Step 4: Access the Application

- **DM Area:** `http://unraid-ip:3000/dm`
- **Player Area:** `http://unraid-ip:3000/`
- **GraphQL API:** `ws://unraid-ip:3000/graphql`

---

## 📋 Unraid Template

Save this as `dungeon-revealer.xml` in your Unraid templates folder:

```xml
<?xml version="1.0"?>
<Container version="2">
  <Name>dungeon-revealer</Name>
  <Repository>dungeon-revealer:v1.17.1-phase2</Repository>
  <Registry>https://registry-1.docker.io</Registry>
  <Network>bridge</Network>
  <Privileged>false</Privileged>
  <Support>https://github.com/Slippage23/dungeon-revealer</Support>
  <Project>https://github.com/Slippage23/dungeon-revealer</Project>
  <Overview>A real-time web app for tabletop gaming (D&D, Cyberpunk, etc.) with DM and player areas.</Overview>
  <Category>Gaming</Category>
  <WebUI>http://[IP]:[PORT:3000]/</WebUI>
  <TemplateURL>raw.githubusercontent.com/Slippage23/dungeon-revealer/master/.unraid/dungeon-revealer.xml</TemplateURL>

  <Environment>
    <Variable Name="DM_PASSWORD" Value="change-me" Description="Password for Dungeon Master access"/>
    <Variable Name="PC_PASSWORD" Value="change-me" Description="Password for Player access"/>
    <Variable Name="NODE_ENV" Value="production" Description="Node environment"/>
  </Environment>

  <Ports>
    <Port Name="dungeon-revealer" Protocol="tcp" Port="3000" HostPort="3000" Description="GraphQL API + WebSocket"/>
  </Ports>

  <Volumes>
    <Volume Name="Data" HostDir="/mnt/user/appdata/dungeon-revealer/data" ContainerDir="/usr/src/app/data" Access="rw" Description="Application data and database"/>
  </Volumes>
</Container>
```

---

## 🔧 Configuration

### Environment Variables

| Variable        | Required | Default          | Description                        |
| --------------- | -------- | ---------------- | ---------------------------------- |
| `DM_PASSWORD`   | Yes      | -                | Password for DM authentication     |
| `PC_PASSWORD`   | Yes      | -                | Password for Player authentication |
| `NODE_ENV`      | No       | production       | Node.js environment                |
| `DATABASE_PATH` | No       | ./data/db.sqlite | Path to SQLite database            |

### Port Configuration

| Port | Protocol | Service     | Purpose                         |
| ---- | -------- | ----------- | ------------------------------- |
| 3000 | TCP      | GraphQL API | WebSocket connections, REST API |

### Volume Configuration

| Mount Point         | Host Path                                 | Purpose                                  |
| ------------------- | ----------------------------------------- | ---------------------------------------- |
| `/usr/src/app/data` | `/mnt/user/appdata/dungeon-revealer/data` | SQLite database, uploaded maps, settings |

---

## 📦 What's Included in the Image

### Backend

- Node.js 16 (slim image)
- Express server with GraphQL API
- SQLite database support
- Socket.IO WebSocket server

### Frontend

- Pre-built React application
- Static assets optimized
- Relay GraphQL client

### Features

- **Phase 1:** Advanced Token Management (HP, conditions, initiative)
- **Phase 2:** Enhanced Note System (templates, categories, backlinks)

---

## 🔐 Security Best Practices

### For Production Deployment

1. **Change default passwords** - Set strong DM_PASSWORD and PC_PASSWORD
2. **Use HTTPS** - Put behind a reverse proxy (nginx, Caddy) with SSL
3. **Restrict access** - Use firewall rules to limit port 3000 access
4. **Regular backups** - Backup `/mnt/user/appdata/dungeon-revealer/data/` regularly
5. **Update regularly** - Check for newer image versions periodically

### Example Nginx Reverse Proxy Config

```nginx
server {
    listen 443 ssl http2;
    server_name dungeon-revealer.local;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 🐛 Troubleshooting

### Container won't start

```bash
# Check logs
docker logs dungeon-revealer

# Verify image exists
docker images | grep dungeon-revealer

# Try running interactively
docker run -it dungeon-revealer:v1.17.1-phase2 /bin/bash
```

### Database errors

```bash
# Recreate database (will erase data!)
docker exec dungeon-revealer rm /usr/src/app/data/db.sqlite
docker restart dungeon-revealer
```

### Permission issues

```bash
# Fix data folder permissions
docker exec dungeon-revealer chown -R node:node /usr/src/app/data
```

### Application won't respond

1. Check port is open: `telnet localhost 3000`
2. Check logs: `docker logs -f dungeon-revealer`
3. Verify passwords are set correctly
4. Try restarting: `docker restart dungeon-revealer`

---

## 📊 Performance Tips

1. **Allocate enough memory** - Recommend 2GB+ for the container
2. **Use SSD storage** - Place Unraid appdata on fast storage
3. **Regular database maintenance** - Container includes SQLite
4. **Monitor resource usage** - Use Unraid's monitoring tools

---

## 🔄 Updating

To update to a newer version:

1. Pull latest image:

   ```bash
   docker pull dungeon-revealer:latest
   ```

2. Stop current container:

   ```bash
   docker stop dungeon-revealer
   ```

3. Remove old container:

   ```bash
   docker rm dungeon-revealer
   ```

4. Create new container with steps from **Step 2**

Your data will be preserved in the volume `/mnt/user/appdata/dungeon-revealer/data/`

---

## 📝 Build Information

### Multi-stage Build Process

The Dockerfile uses multi-stage builds:

1. **dependency-builder** - Installs all npm dependencies
2. **application-builder** - Builds frontend (Vite) and backend (TypeScript)
3. **production-dependency-builder** - Prunes to production-only dependencies
4. **final** - Minimal node:16-slim image with only production artifacts

### Build Optimizations

- Excluded build files (node_modules, source maps)
- Optimized with Vite for production
- Compressed with multi-stage build
- Final image: 501 MB (4x smaller than development)

---

## 🎮 First Run Checklist

After starting the container:

- [ ] Access http://localhost:3000
- [ ] Login with DM password → /dm
- [ ] Create a test map
- [ ] Add a token to the map
- [ ] Test HP tracking
- [ ] Test applying a template
- [ ] Login as player and view map
- [ ] Verify data persists after container restart

---

## 📞 Support & Resources

- **GitHub:** https://github.com/Slippage23/dungeon-revealer
- **Documentation:** See RELEASE_v1.17.1.md for complete feature list
- **Issues:** Report on GitHub

---

## ✅ Production Checklist

- [x] Docker image built and tested
- [x] Multi-stage build optimized
- [x] Security best practices included
- [x] Documentation provided
- [x] Unraid template available
- [x] Ready for deployment

**Your Dungeon Revealer Docker image is production-ready! 🚀**
