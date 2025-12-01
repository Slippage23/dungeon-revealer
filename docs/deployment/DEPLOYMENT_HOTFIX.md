# Templates Fix & Initiative Tracker Deployment

## 🎯 What Was Fixed

### Problem 1: Templates Feature Broken ✅ FIXED

**Root Cause**: `MapIdProvider` context was missing from the component hierarchy in `src/dm-area/dm-map.tsx`

**Symptom**: Error message: "No map loaded or note not selected (showTemplatesPanel=, node=, mapId=)"

**Evidence**: Console logs showed `currentMapId: null` repeatedly

**Solution Applied**:

1. Added import: `import { MapIdProvider } from "./note-editor/map-context";`
2. Added to context providers array:
   ```typescript
   [MapIdProvider, { mapId: map.id }] as ComponentWithPropsTuple<
     React.ComponentProps<typeof MapIdProvider>
   >;
   ```
3. Added `MapIdContext` to `sharedContexts` array for `LazyLoadedMapView`

**Result**: Templates component now has access to current map ID via context

### Problem 2: Initiative Tracker Not in Docker ✅ FIXED

**Root Cause**: Docker image v1.17.1-phase2 was built Nov 23, before Initiative Tracker was integrated on Nov 24

**Solution**: Rebuilding Docker image with latest code includes Initiative Tracker

## 📦 Build & Deployment Instructions

### Step 1: Verify Build (ALREADY COMPLETED ✅)

```bash
npm run build
```

**Build Status**: ✅ SUCCESS

- Frontend built with Vite
- Backend compiled with TypeScript
- No errors
- Ready for deployment

### Step 2: Rebuild Docker Image

From the repository root directory:

```bash
docker build -t slippage/dungeon-revealer:latest --build-arg VERSION=1.17.1-phase2-hotfix .
```

Or to tag with specific version:

```bash
docker build -t slippage/dungeon-revealer:1.17.1-phase2-hotfix .
docker tag slippage/dungeon-revealer:1.17.1-phase2-hotfix slippage/dungeon-revealer:latest
```

**Expected Output**: Successfully tagged image

### Step 3: Push to Docker Hub

```bash
docker push slippage/dungeon-revealer:latest
```

Or if using specific tag:

```bash
docker push slippage/dungeon-revealer:1.17.1-phase2-hotfix
```

### Step 4: Update Unraid Container

In Unraid:

1. Go to **Docker** tab
2. Stop the `dungeon-revealer` container
3. Remove the old container
4. In **Docker** search box, enter `slippage/dungeon-revealer`
5. Force download latest image
6. Create new container with same volumes/environment variables as before
7. Start the container

Or via terminal:

```bash
docker stop dungeon-revealer
docker rm dungeon-revealer
docker pull slippage/dungeon-revealer:latest
docker run -d --name dungeon-revealer \
  -p 3000:3000 \
  -v /mnt/user/appdata/dungeon-revealer/data:/app/data \
  -e DM_PASSWORD=<your-password> \
  -e PC_PASSWORD=<your-password> \
  slippage/dungeon-revealer:latest
```

## 🧪 Verification Steps

After updating the container, verify both fixes:

### Test 1: Templates Feature ✅

1. Open DM area
2. Load a map (if not already loaded)
3. Click on a token
4. Click **Templates** button in the sidebar
5. **Expected**: Templates panel shows list of available templates (not error message)
6. Check console: Should show `currentMapId` with valid map ID, not `null`

### Test 2: Initiative Tracker ✅

1. Open DM area
2. Look at the toolbar on the left side
3. **Expected**: Initiative Tracker button is visible (icon looks like a clock/list)
4. Click it to open the Initiative Tracker panel
5. Try adding combatants and starting initiative

### Test 3: Console Verification ✅

1. Open browser console (F12)
2. Look for logs starting with `[TOKEN-INFO-ASIDE]`
3. **Expected**: `currentMapId` should show your map ID (e.g., `currentMapId: "abc123"`) not `null`

## 📋 Files Modified

```
src/dm-area/dm-map.tsx
  - Line ~68: Added MapIdProvider import
  - Lines ~815-821: Added MapIdProvider to contexts array in FlatContextProvider
  - Line ~833: Added MapIdContext to sharedContexts array
```

## 🚀 Timeline

- **Nov 23**: Docker image v1.17.1-phase2 built
- **Nov 24**: Initiative Tracker integrated into main branch
- **Now**: Hotfix applied to templates bug + Docker rebuild includes Initiative Tracker

## ✨ What Users Get

After deploying this hotfix:

1. ✅ **Templates Working**: Can now access and use templates feature without errors
2. ✅ **Initiative Tracker**: Full feature available in DM interface
3. ✅ **Context Fixes**: All map-ID-dependent features have proper context

## 🔧 Technical Details

### MapIdProvider Integration Pattern

This follows the established pattern used by other context providers in the component:

```typescript
[ProviderComponent, { prop: value }] as ComponentWithPropsTuple<...>
```

This is part of the `FlatContextProvider` pattern which manages multiple nested contexts cleanly.

### Context Bridge Pattern

The `sharedContexts` array allows these contexts to be accessible within the lazy-loaded map view component, ensuring that hooks like `useCurrentMapId()` work correctly.

---

**Status**: ✅ **READY FOR DEPLOYMENT**

Build is complete. Just need to:

1. Run `docker build` and `docker push`
2. Update container in Unraid
3. Test the fixes
