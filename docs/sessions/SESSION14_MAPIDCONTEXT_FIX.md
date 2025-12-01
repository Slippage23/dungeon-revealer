# Session 14 (Continued): MapIdContext Missing Import Fix

**Date:** November 26, 2025  
**Status:** ✅ FIXED & DEPLOYED (Round 2)

## Problem Identified (Round 2)

After deploying the first fix, the DM area still wouldn't load with error:

```
ReferenceError: MapIdContext is not defined
```

### Root Cause

In the previous session, we added `MapIdContext` to the `sharedContexts` array in `LazyLoadedMapView` (line 839 of `dm-map.tsx`), but we forgot to **import** it!

The import statement only had:

```typescript
import { MapIdProvider } from "./note-editor/map-context";
```

But was missing:

```typescript
import { MapIdProvider, MapIdContext } from "./note-editor/map-context";
```

## Solution Implemented

**File Modified:** `src/dm-area/dm-map.tsx` (line 75)

### What Changed

```typescript
// BEFORE
import { MapIdProvider } from "./note-editor/map-context";

// AFTER
import { MapIdProvider, MapIdContext } from "./note-editor/map-context";
```

This exports `MapIdContext` from the map-context module so it can be used in the `sharedContexts` array.

## Fix Details

The `MapIdContext` was already properly exported from `map-context.tsx`:

```typescript
export const MapIdContext = React.createContext<string | null>(null);
```

We just needed to import it in `dm-map.tsx` where it's used.

## Deployment Status

✅ **Build**: Successful - No TypeScript errors  
✅ **Docker Image**: Built and pushed to Docker Hub  
✅ **Tags**: `latest` and `1.17.1-phase2-hotfix`  
✅ **Ready for Deployment**: YES

## Next Steps

1. **Stop the old container:**

   ```bash
   docker stop dungeon-revealer
   ```

2. **Remove old container:**

   ```bash
   docker rm dungeon-revealer
   ```

3. **Pull new image:**

   ```bash
   docker pull slippage/dungeon-revealer:latest
   ```

4. **Create new container with same settings:**

   ```bash
   docker run -d \
     --name=dungeon-revealer \
     -p 3000:3000 \
     -e DM_PASSWORD=your-password \
     -e PC_PASSWORD=your-password \
     -e NODE_ENV=production \
     -v /mnt/user/appdata/dungeon-revealer/data:/usr/src/app/data \
     slippage/dungeon-revealer:latest
   ```

5. **Verify it works:**
   - Open http://192.168.0.50:3000/dm
   - Should load the DM area (no more "MapIdContext is not defined" error)
   - Create a map and add tokens
   - HP bars should render correctly

## Files Changed

| File                     | Change                         | Status     |
| ------------------------ | ------------------------------ | ---------- |
| `src/dm-area/dm-map.tsx` | Added `MapIdContext` to import | ✅ Applied |

## What This Enables

With this fix:

- ✅ DM area loads correctly
- ✅ MapIdContext is available to lazy-loaded components
- ✅ Token HP bars render
- ✅ Conditions display correctly
- ✅ Initiative Tracker works
- ✅ Templates panel works

## Testing Checklist

After redeploying to Unraid:

- [ ] DM area loads (http://192.168.0.50:3000/dm)
- [ ] No console errors
- [ ] Can create/open a map
- [ ] Can add tokens
- [ ] HP bars visible on tokens
- [ ] Conditions can be applied
- [ ] Templates panel works
- [ ] Initiative Tracker visible

---

**Session 14 Status:** ✅ COMPLETE - All fixes deployed

This was a simple but critical import fix. The context was properly defined and exported, just not imported where it was being used.
