# Publishing to Docker Hub

## Quick Publish Guide

### Prerequisites

1. Docker Hub account (free): https://hub.docker.com
2. Docker installed locally
3. This repository cloned/downloaded

### Step-by-Step Publishing

#### 1. Login to Docker Hub

```bash
docker login
# Enter your Docker Hub username and password
```

#### 2. Build the Image

```bash
# Replace 'yourusername' with your actual Docker Hub username
docker build -t yourusername/dungeon-revealer-manager:latest .
```

#### 3. Test Locally (Important!)

```bash
# Test that the image works
docker run -d \
  --name test-manager \
  -p 3001:3001 \
  -v $(pwd)/data:/data \
  yourusername/dungeon-revealer-manager:latest

# Access http://localhost:3001 and verify it works

# Stop and remove test container
docker stop test-manager
docker rm test-manager
```

#### 4. Push to Docker Hub

```bash
docker push yourusername/dungeon-revealer-manager:latest
```

#### 5. Verify on Docker Hub

- Go to https://hub.docker.com/r/yourusername/dungeon-revealer-manager
- You should see your image listed

### Using Automated Script

I've included a publish script for convenience:

```bash
chmod +x publish.sh
./publish.sh yourusername
```

This will:

1. Build the image
2. Tag it properly
3. Push to Docker Hub
4. Create version tags

---

## Version Tagging

### Recommended Tagging Strategy

```bash
# Latest version (always points to newest)
docker tag yourusername/dungeon-revealer-manager:latest yourusername/dungeon-revealer-manager:latest

# Specific version
docker tag yourusername/dungeon-revealer-manager:latest yourusername/dungeon-revealer-manager:2.0.0

# Major version
docker tag yourusername/dungeon-revealer-manager:latest yourusername/dungeon-revealer-manager:2

# Push all tags
docker push yourusername/dungeon-revealer-manager:latest
docker push yourusername/dungeon-revealer-manager:2.0.0
docker push yourusername/dungeon-revealer-manager:2
```

---

## Unraid Installation (After Publishing)

### Method 1: Unraid Docker Tab

1. Open Unraid WebUI → Docker tab
2. Click "Add Container"
3. Fill in:

   ```
   Name: DungeonRevealerManager
   Repository: yourusername/dungeon-revealer-manager:latest
   Network Type: Bridge

   Port Mappings:
   - Container Port: 3001
   - Host Port: 3001

   Path Mappings:
   - Container Path: /data
   - Host Path: /mnt/user/appdata/dungeon-revealer-manager
   ```

4. Click Apply

### Method 2: Docker Command on Unraid

SSH into Unraid:

```bash
docker run -d \
  --name=DungeonRevealerManager \
  --net=bridge \
  -p 3001:3001 \
  -v /mnt/user/appdata/dungeon-revealer-manager:/data \
  -e NODE_ENV=production \
  --restart unless-stopped \
  yourusername/dungeon-revealer-manager:latest
```

---

## Updating Your Published Image

When you make changes to the code:

```bash
# 1. Rebuild
docker build -t yourusername/dungeon-revealer-manager:latest .

# 2. Test locally
docker run -d -p 3001:3001 -v ./data:/data yourusername/dungeon-revealer-manager:latest
# Test it works...

# 3. Push update
docker push yourusername/dungeon-revealer-manager:latest
```

Users can update by:

```bash
docker pull yourusername/dungeon-revealer-manager:latest
docker restart DungeonRevealerManager
```

---

## Creating a GitHub Repository (Optional but Recommended)

### Why GitHub?

- Version control
- Issue tracking
- Community contributions
- Automatic Docker Hub builds

### Quick Setup

1. **Create GitHub repo**: https://github.com/new

   - Name: `dungeon-revealer-manager`
   - Make it public

2. **Push your code**:

   ```bash
   cd C:\Temp\git\dungeon-revealer-api-unraid
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/dungeon-revealer-manager.git
   git push -u origin main
   ```

3. **Link Docker Hub to GitHub** (Auto-builds):
   - Go to Docker Hub → Account Settings → Linked Accounts
   - Connect GitHub
   - In your Docker Hub repo → Builds → Configure Automated Builds
   - Now every push to GitHub will rebuild on Docker Hub!

---

## Complete Example

Let's say your Docker Hub username is **`johndoe`**:

### Publishing:

```bash
docker login
docker build -t johndoe/dungeon-revealer-manager:latest .
docker push johndoe/dungeon-revealer-manager:latest
```

### Unraid Users Install:

```bash
docker run -d \
  --name=DungeonRevealerManager \
  -p 3001:3001 \
  -v /mnt/user/appdata/dungeon-revealer-manager:/data \
  johndoe/dungeon-revealer-manager:latest
```

### Your Docker Hub Page:

`https://hub.docker.com/r/johndoe/dungeon-revealer-manager`

---

## Docker Hub Repository Settings

### Description (for Docker Hub page):

```
Dungeon Revealer Map Manager - Web Edition

A web-based tool to manage maps, tokens, and monster data for Dungeon Revealer
virtual tabletop. Designed for Unraid and Docker deployments.

Features:
- View and browse server maps
- Token management with search
- Dashboard statistics
- Web-based configuration

Perfect for Unraid users running Dungeon Revealer!
```

### Full Description:

Copy the content from `README.md`

### Categories:

- Games
- Utilities

---

## Troubleshooting

### "denied: requested access to the resource is denied"

- Make sure you're logged in: `docker login`
- Verify username matches: `docker tag yourusername/...`

### "repository does not exist"

- Docker Hub repos are auto-created on first push
- Make sure format is: `username/repository:tag`

### Build fails

- Check Dockerfile syntax
- Verify all files exist
- Review error messages

---

## Support & Updates

Once published:

- Update your README on Docker Hub
- Create a GitHub repo for issues/discussions
- Version your releases
- Document changes in CHANGELOG.md

---

## Quick Publish Script

Use the included `publish.sh`:

```bash
./publish.sh yourusername
```

This handles everything automatically!
