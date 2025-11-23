# Docker Desktop GUI Setup for Dungeon Revealer

## How to Translate the Docker Command to Docker Desktop GUI

### ✅ Fill in the Form Fields

| **Form Field**        | **What to Enter**        | **Example**          |
| --------------------- | ------------------------ | -------------------- |
| **Container name**    | A name for your instance | `dungeon-revealer`   |
| **Host port**         | External port            | `3000`               |
| **(port auto-fills)** | Container port           | `/tcp` (auto-filled) |

---

## 📍 Volumes Section

Click the **"+"** button to add the volume:

| **Host path**           | **Container path**  |
| ----------------------- | ------------------- |
| `dungeon-revealer-data` | `/usr/src/app/data` |

**Why?** This stores your maps, tokens, and notes persistently so they don't disappear when the container stops.

---

## 🔐 Environment Variables Section

Click the **"+"** button to add **EACH** of these:

### Required Variables:

| **Variable**  | **Value**              | **Purpose**                                |
| ------------- | ---------------------- | ------------------------------------------ |
| `DM_PASSWORD` | `your_secure_password` | Password to access DM area (full control)  |
| `PC_PASSWORD` | `player_password`      | Password to access Player area (view-only) |
| `NODE_ENV`    | `production`           | Sets app to production mode                |

**Example Values:**

```
DM_PASSWORD = MySecurePassword123!
PC_PASSWORD = PlayerAccess456!
NODE_ENV = production
```

---

## 🚀 Step-by-Step Instructions

1. **Click "Run a new container"** at the top
2. **Select image**: `slippage/dungeon-revealer:latest`
3. **Under "Optional settings":**

### Container name

```
dungeon-revealer
```

### Ports

- Host port: `3000`

### Volumes

- Host path: `dungeon-revealer-data`
- Container path: `/usr/src/app/data`

### Environment variables

Add these 3 variables by clicking **+** for each:

1. Variable: `DM_PASSWORD` → Value: `your_password`
2. Variable: `PC_PASSWORD` → Value: `player_password`
3. Variable: `NODE_ENV` → Value: `production`

4. **Click "Run"**

---

## ✅ After Container Starts

1. Go to **http://localhost:3000**
2. Choose your role:
   - **DM Area**: Enter your `DM_PASSWORD`
   - **Player Area**: Enter your `PC_PASSWORD`

---

## 🔧 Troubleshooting

| **Issue**                                                   | **Solution**                                                                                     |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Can't access http://localhost:3000                          | Check port 3000 is mapped in Ports section                                                       |
| Login fails                                                 | Check `DM_PASSWORD` and `PC_PASSWORD` are set in Environment variables                           |
| Data disappears after restart                               | Check volume is mapped: `dungeon-revealer-data` → `/usr/src/app/data`                            |
| Container won't start                                       | Check Docker logs (right-click container → Logs)                                                 |
| **Template button shows "Form submission cancelled" error** | **Create a map and press "Shroud all" to initialize fog-of-war file. Then templates will work.** |
| Templates panel shows "No map loaded or note not selected"  | 1. Create a Map, 2. Add a Token, 3. Click the Token to select it, 4. Then click Templates button |

---

## 📋 Complete Command Reference

This is what Docker Desktop translates to under the hood:

```bash
docker run \
  --name dungeon-revealer \
  -p 3000:3000 \
  -v dungeon-revealer-data:/usr/src/app/data \
  -e DM_PASSWORD=your_password \
  -e PC_PASSWORD=player_password \
  -e NODE_ENV=production \
  slippage/dungeon-revealer:latest
```

---

## 🎮 Next Steps

1. **Create a Map**: Go to Maps section → Create New Map
2. **Add Tokens**: Upload token images
3. **Share with Players**: Give them the URL: `http://your-ip:3000`
4. **Players enter password**: They use `PC_PASSWORD` to view maps

Enjoy Dungeon Revealer! 🐉
