# 🐉 Dungeon Revealer - Deployment & Setup Guide

## Table of Contents

1. [Docker Desktop Setup](#docker-desktop-setup)
2. [Docker CLI Setup](#docker-cli-setup)
3. [First Time Setup](#first-time-setup)
4. [Features](#features)
5. [Troubleshooting](#troubleshooting)

---

## Docker Desktop Setup

### Docker Desktop GUI Configuration

Follow these steps in Docker Desktop:

#### 1. Container Name

```
dungeon-revealer
```

#### 2. Ports

- **Host port:** `3000`
- Container port will auto-fill as `/tcp`

#### 3. Volumes

Click the **"+"** button to add:
| **Host path** | **Container path** |
|---|---|
| `dungeon-revealer-data` | `/usr/src/app/data` |

**Why?** Persistent storage for maps, tokens, and notes.

#### 4. Environment Variables

Click **"+"** to add each:

| **Variable**  | **Value**              | **Purpose**                    |
| ------------- | ---------------------- | ------------------------------ |
| `DM_PASSWORD` | `your_secure_password` | Access DM area (full control)  |
| `PC_PASSWORD` | `player_password`      | Access Player area (view-only) |
| `NODE_ENV`    | `production`           | Production mode                |

#### 5. Run

Click **"Run"** button and wait for container to start.

Access at: `http://localhost:3000`

---

## Docker CLI Setup

If you prefer command-line:

```bash
docker run \
  --name dungeon-revealer \
  -p 3000:3000 \
  -v dungeon-revealer-data:/usr/src/app/data \
  -e DM_PASSWORD=your_secure_password \
  -e PC_PASSWORD=player_password \
  -e NODE_ENV=production \
  --restart=unless-stopped \
  -d slippage/dungeon-revealer:latest
```

Then access: `http://localhost:3000`

---

## First Time Setup

After container starts, follow these steps:

### Step 1: Access the App

- Open browser: `http://localhost:3000`
- You should see the login screen

### Step 2: Login as DM

- Click **"DM Area"** button
- Enter password: `DM` (or your custom `DM_PASSWORD`)
- Press Enter

### Step 3: Create Your First Map

1. Click **"Maps"** in the left sidebar
2. Click **"Create New Map"** button
3. Give it a name (e.g., "Tavern")
4. Upload a map image (optional)
5. Click **"Create"**

### Step 4: Initialize Fog-of-War ⚠️ IMPORTANT!

This step is **crucial** for Templates to work!

1. **Open the map** you just created
2. Look for the **"Shroud All"** button in the toolbar
3. Click it to initialize the fog-of-war system
4. You should see the entire map covered with a dark overlay

✅ **Now the Templates system will work!**

### Step 5: Add a Token to the Map

1. Click **"Add Token"** or **"Upload Token"** option in the map
2. Add a token/marker to the map
3. Click on it to select it

### Step 6: Use Templates Panel

1. Look for the **List icon** (☰) button in the right sidebar
2. Click it to open the **Templates Panel**
3. Select any template (Quest, NPC, Encounter, etc.)
4. Template content appends to your note!

### Setup Checklist

- [ ] Logged in as DM
- [ ] Created a map
- [ ] Clicked "Shroud All" to initialize fog-of-war
- [ ] Added a token to the map
- [ ] Selected the token
- [ ] Opened Templates panel
- [ ] Successfully used a template

---

## Features

### Phase 1: Advanced Token Management

- **HP Tracking** with visual indicators
- **15 D&D Status Conditions** (Poisoned, Stunned, etc.)
- **Initiative Tracker** for combat management
- **Quick damage/healing** interface

### Phase 2: Enhanced Note System

- **7 Pre-built Templates**: Quest, NPC, Encounter, Item, Location, Shop, Plot
- **Append-based Templates**: Content adds to existing notes
- **Hierarchical Categories**: Organize notes by type
- **Bidirectional Backlinking**: Connect related notes

### Standard Features

- **Real-time Map Viewing** for players
- **Fog-of-war System** for concealing unrevealed areas
- **Token Management** with movement and status tracking
- **WebSocket Live Queries** for instant updates
- **Role-based Access**: DM vs Player areas

---

## Troubleshooting

### Can't Access http://localhost:3000

- Check port 3000 is mapped in Ports section
- Verify container is running: `docker ps`

### Login Fails

- Check `DM_PASSWORD` and `PC_PASSWORD` are set correctly
- Verify you're entering the right passwords
- Check Docker logs: right-click container → Logs

### Data Disappears After Restart

- Ensure volume is mapped: `dungeon-revealer-data` → `/usr/src/app/data`
- Check volume exists: `docker volume ls | grep dungeon`

### Container Won't Start

- Check Docker logs: right-click container → Logs
- Verify sufficient disk space
- Try pulling latest image: `docker pull slippage/dungeon-revealer:latest`

### Templates Panel Shows "Form submission cancelled"

**Solution:** Initialize fog-of-war by clicking "Shroud All" on your map (see Step 4 in First Time Setup)

### Templates Panel Shows "No map loaded or note not selected"

1. Ensure a map is created
2. Add a token to the map
3. Click the token to select it
4. Then click Templates button

### Performance Issues

- Reduce map image size (large images can slow rendering)
- Clear browser cache (Ctrl+Shift+Del)
- Reduce fog-of-war complexity on very large maps

---

## Architecture

### Technology Stack

- **Frontend:** React 17, Relay GraphQL, Vite, Chakra UI, Three.js
- **Backend:** Node.js 16, Express, GraphQL API, SQLite
- **Real-time:** Socket.IO WebSocket + GraphQL Live Queries
- **Container:** Docker multi-stage build (501 MB)

### Network

- **DM Area:** Full control at `/dm`
- **Player Area:** View-only at `/`
- **Port:** 3000 (GraphQL API + WebSocket)
- **Database:** SQLite at `/usr/src/app/data/db.sqlite`

### Data Persistence

- Maps, tokens, and notes stored in Docker volume
- Data survives container restarts
- Backup: copy volume directory

---

## Environment Variables

| Variable      | Default | Required | Purpose                            |
| ------------- | ------- | -------- | ---------------------------------- |
| `NODE_ENV`    | -       | ✅       | Set to `production` for deployment |
| `DM_PASSWORD` | -       | ✅       | Password for DM area access        |
| `PC_PASSWORD` | -       | ✅       | Password for Player area access    |

---

## Docker Image Info

- **Repository:** `slippage/dungeon-revealer`
- **Tags:** `latest`, `v1.17.1-phase2`
- **Size:** 501 MB (compressed)
- **Base Image:** Node.js 16-slim
- **Command:** `node server-build/index.js`
- **Exposed Port:** 3000

---

## Quick Links

- **GitHub Repository:** https://github.com/Slippage23/dungeon-revealer
- **Docker Hub:** https://hub.docker.com/r/slippage/dungeon-revealer
- **Issues & Feedback:** https://github.com/Slippage23/dungeon-revealer/issues

---

## Support

For issues or questions:

1. Check the [Troubleshooting](#troubleshooting) section above
2. Review [First Time Setup](#first-time-setup) for common setup issues
3. Check Docker logs for error messages
4. Open an issue on GitHub

Enjoy your D&D campaigns with Dungeon Revealer! 🎲🐉
