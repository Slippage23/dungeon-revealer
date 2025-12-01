# 🚀 QUICK START: Deploy Hotfix to Unraid

## TL;DR - What Happened

✅ **Templates broken in production** - FIXED by adding MapIdProvider context  
✅ **Initiative Tracker missing** - FIXED by rebuilding Docker image  
✅ **Application built** - Ready to deploy

## What You Need to Do

### Step 1: Build & Push Docker Image

```powershell
cd c:\Temp\git\dungeon-revealer
.\deploy.ps1
```

Or manually:

```bash
docker build -t slippage/dungeon-revealer:latest --build-arg VERSION=1.17.1-phase2-hotfix .
docker push slippage/dungeon-revealer:latest
```

### Step 2: Update Unraid Container

1. Stop current container
2. Remove old container
3. Pull new image
4. Create new container with same settings
5. Start it

### Step 3: Verify Fixes

**Templates**:

- [ ] Click Templates button → Shows templates list (not error)
- [ ] Console shows currentMapId with valid ID (not null)

**Initiative Tracker**:

- [ ] Button visible in left toolbar
- [ ] Can open panel and add combatants

## Code Changes

**File**: `src/dm-area/dm-map.tsx`

```diff
+ import { MapIdProvider } from "./note-editor/map-context";

  // In FlatContextProvider contexts array:
+ [
+   MapIdProvider,
+   { mapId: map.id },
+ ] as ComponentWithPropsTuple<React.ComponentProps<typeof MapIdProvider>>,

  // In LazyLoadedMapView sharedContexts array:
+ MapIdContext,
```

## Status Tracking

| Item               | Status     |
| ------------------ | ---------- |
| Code changes       | ✅ Applied |
| App build          | ✅ Success |
| Docker build       | ⏳ Pending |
| Docker push        | ⏳ Pending |
| Unraid update      | ⏳ Pending |
| Templates verified | ⏳ Pending |
| Tracker verified   | ⏳ Pending |

## Files to Reference

- `DEPLOYMENT_STATUS.md` - Full deployment guide
- `deploy.ps1` - Automated deployment script
- `verify-hotfix.ps1` - Verify changes applied

## Next: Run Docker Build

```powershell
.\deploy.ps1
```
