# Quick Test Guide - Session 14 Fix

## 🎯 What Was Fixed

The issue was that when you added tokens to a map, they didn't get database entries in the `token_data` table. This caused:

- ❌ HP bars not rendering
- ❌ Conditions not showing
- ❌ Console errors about "Cannot read properties of undefined"

**The fix**: Now when tokens are added, database entries are automatically created.

---

## 📋 Before You Deploy

Make sure you have:

- New Docker image: `slippage/dungeon-revealer:latest` (should be available now)
- Unraid with Docker support
- Access to http://unraid-ip:3000/dm

---

## 🚀 Deployment Steps

### Step 1: Stop Current Container

```bash
docker stop dungeon-revealer
```

### Step 2: Remove Old Container

```bash
docker rm dungeon-revealer
```

### Step 3: Pull New Image

```bash
docker pull slippage/dungeon-revealer:latest
```

### Step 4: Start New Container

```bash
docker run -d \
  --name=dungeon-revealer \
  -p 3000:3000 \
  -e DM_PASSWORD=your-dm-password \
  -e PC_PASSWORD=your-player-password \
  -e NODE_ENV=production \
  -v /mnt/user/appdata/dungeon-revealer/data:/usr/src/app/data \
  slippage/dungeon-revealer:latest
```

### Step 5: Wait for Startup

- Wait about 5-10 seconds for the container to initialize
- Check logs: `docker logs dungeon-revealer`

---

## ✅ Testing the Fix

### Test 1: Add a Token (Most Important)

1. Open: `http://unraid-ip:3000/dm`
2. Create or open a map
3. Add a token by clicking on the map
4. **Expected Result**: Token appears with an HP bar (even if 0/0)
5. **Check console (F12)**:
   - Should see logs like: `[TOKEN-INFO-ASIDE] Rendering sidebar...`
   - Should NOT see errors about "Cannot read properties of undefined"

### Test 2: Apply Damage

1. Click on a token to select it
2. Look at the right sidebar (token info)
3. Click a damage button (e.g., "Damage 5")
4. **Expected Result**: HP bar updates, shows reduced HP
5. **Check console**: Should see mutation logs

### Test 3: Apply Conditions

1. Select a token
2. In token info sidebar, look for "Conditions" section
3. Click to apply a condition (e.g., "Blinded")
4. **Expected Result**: Condition icon appears next to token label
5. **Check console**: Should see condition mutation logs

### Test 4: Initiative Tracker

1. Look in the left toolbar for "Initiative Tracker" button
2. Click it
3. **Expected Result**: Panel opens, can add tokens to initiative
4. Select a token, set initiative value
5. Start combat
6. **Expected Result**: One token highlights as "active"

---

## 🔍 Troubleshooting

### If HP bars don't show:

**Check 1: Console Logs**

```javascript
// Open F12 DevTools → Console tab
// Should see logs like:
[TOKEN-INFO-ASIDE] Rendering sidebar, showLibrary: true ...
[TokenHealthBar] Rendering with HP: 0
```

**Check 2: Browser Console Errors**

```javascript
// Look for any red errors
// If you see: "Cannot read properties of undefined (reading 'length')"
// That means tokenData is still null
```

**Check 3: Database**

```bash
# SSH into Unraid and check:
docker exec dungeon-revealer sqlite3 /usr/src/app/data/db.sqlite \
  "SELECT COUNT(*) FROM token_data;"

# Should return a number > 0
```

### If Container Won't Start

```bash
# Check logs
docker logs dungeon-revealer

# Look for errors like:
# - "Port 3000 already in use"
# - Database initialization errors
# - Missing environment variables

# Try restarting
docker restart dungeon-revealer

# Check status
docker ps | grep dungeon-revealer
```

### If Old Data Missing

If you had tokens before this fix, they might not have database entries. To create them:

```bash
# Connect to database
docker exec dungeon-revealer sqlite3 /usr/src/app/data/db.sqlite

# Run this SQL to find tokens without data:
SELECT mt.id FROM maps_backup mt
LEFT JOIN token_data td ON mt.id = td.token_id
WHERE td.id IS NULL;
```

---

## 📊 What's in the Database Now

Each token now has a `token_data` row like:

```
id          1
token_id    "abc-123-def"
map_id      "map-456"
current_hp  0
max_hp      null
temp_hp     0
armor_class null
conditions  "[]"  (JSON array)
```

This row is created automatically when:

- ✅ You add a token via UI
- ✅ You add tokens via GraphQL mutation

---

## 🎮 Feature Usage

### HP Tracking

1. Select token
2. Right sidebar shows "HP: 0"
3. Click buttons to apply damage/healing
4. HP bar shows progress visually

### Conditions

1. Select token
2. In token info, toggle conditions
3. Each condition shows as an icon
4. Multiple conditions supported:
   - BLINDED, CHARMED, DEAFENED, etc. (26 total)

### Initiative Tracker

1. Click "Initiative" in toolbar
2. Add tokens to combat
3. Set initiative values
4. Start combat
5. View current turn order
6. Advance to next turn

---

## 📞 Still Having Issues?

1. Check console logs (F12)
2. Copy any error messages
3. Check database: `docker exec dungeon-revealer sqlite3 /usr/src/app/data/db.sqlite "SELECT * FROM token_data LIMIT 5;"`
4. Check server logs: `docker logs dungeon-revealer`

---

**Next Session:** If this works, we'll implement:

- Real-time HP updates via WebSocket
- Persistent conditions across page reloads
- Initiative tracker display improvements
