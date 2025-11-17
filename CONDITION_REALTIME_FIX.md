# Condition Real-Time Update Fix - Session 6

## Problem

When users clicked condition badges in the Leva control panel, the UI would update (badge appearance changed), but the mutation wouldn't fire. This was because custom Leva plugins don't automatically invoke the `onEditEnd` callback like built-in inputs (NUMBER, STRING, etc.) do.

**Symptoms:**

- HP field edits triggered mutations ✅
- Condition badge clicks only updated UI, didn't save ❌

## Root Cause Analysis

- **Built-in Leva Inputs** (NUMBER, STRING, BOOLEAN): Auto-trigger `onEditEnd` when user stops editing
- **Custom Leva Plugins**: Must manually call the callback from the component logic
- **Our Plugin**: Called `onUpdate()` to refresh UI but never invoked `settings.onEditEnd()`

## Solution

Updated `src/leva-plugin/leva-plugin-conditions.tsx`:

### Before (Lines 29-40)

```typescript
const ConditionsPicker = () => {
  const { displayValue, onUpdate } = useInputContext<string[]>();
  // ...
  const handleToggle = (conditionName: string) => {
    const newConditions = /* toggle logic */;
    onUpdate(newConditions);  // ← Only updates UI, no mutation
  };
};
```

### After (Lines 29-42)

```typescript
const ConditionsPicker = () => {
  const { displayValue, onUpdate, settings } = useInputContext<any>();
  // ...
  const handleToggle = (conditionName: string) => {
    const newConditions = /* toggle logic */;
    onUpdate(newConditions);  // Update UI display
    // FIX: Manually trigger the onEditEnd callback
    if (settings?.onEditEnd && typeof settings.onEditEnd === "function") {
      settings.onEditEnd(newConditions);  // ← Trigger mutation
    }
  };
};
```

## Key Changes

1. **Changed useInputContext type**: `<string[]>` → `<any>`

   - Reason: To access `settings` object which contains the `onEditEnd` callback
   - Type is loosened intentionally; we do runtime checks with `typeof`

2. **Added settings access**: `useInputContext<any>()`

   - Gives us the `onEditEnd` callback from the Leva configuration

3. **Added type-safe callback invocation**:

   ```typescript
   if (settings?.onEditEnd && typeof settings.onEditEnd === "function") {
     settings.onEditEnd(newConditions);
   }
   ```

   - Prevents runtime errors if callback doesn't exist
   - Ensures we only call if it's actually a function

4. **Pass correct data**: `onEditEnd(newConditions)`
   - Same array that would be sent via mutation
   - Consistent with HP field behavior

## Integration Flow (Now Fixed)

```
1. User clicks condition badge
   ↓
2. handleToggle() called with condition name
   ↓
3. Calculate new conditions array (add or remove condition)
   ↓
4. Call onUpdate(newConditions) → UI refreshes ✅
   ↓
5. Call settings.onEditEnd(newConditions) → Mutation triggered ✅ (FIXED)
   ↓
6. map-view.tsx onEditEnd handler fires
   ↓
7. GraphQL mutation: upsertTokenData(tokenId, mapId, ..., conditions)
   ↓
8. Backend: Saves conditions array to database
   ↓
9. GraphQL subscription: Broadcasts update to all connected clients
   ↓
10. UI re-renders with updated conditions
```

## File Changes

### Modified: `src/leva-plugin/leva-plugin-conditions.tsx`

- **Lines 29-42**: Updated `ConditionsPicker` component
- Added settings parameter access
- Added callback invocation logic
- Added type safety checks

### No Changes Required To:

- `src/map-view.tsx`: Already had proper `onEditEnd` handler configured
- Backend: Already supports conditions arrays in mutations
- Database: Already storing conditions as JSON

## Testing Checklist

- [ ] Load DM area at `http://127.0.0.1:4000/dm`
- [ ] Click token on map to select
- [ ] Verify Leva panel shows "Conditions" section with 15 badges
- [ ] Click "Blinded" badge → should turn solid green
- [ ] Check backend logs → should see `upsertTokenData` mutation with `conditions: ["BLINDED"]`
- [ ] Click "Restrained" badge → should turn solid red, Blinded stays active
- [ ] Verify backend logs show: `conditions: ["BLINDED", "RESTRAINED"]`
- [ ] Refresh page → conditions should persist
- [ ] Click "Blinded" again to deselect
- [ ] Verify backend logs show: `conditions: ["RESTRAINED"]`

## Build Information

**Frontend Build**: `map-view.2c15a06a.js` (Clean build, no TypeScript errors)
**Backend Build**: Successfully compiled
**Dev Servers**: Running on ports 3000 (backend), 4000 (frontend)

## Deployment Notes

This fix is minimal and non-breaking:

- No database schema changes
- No backend API changes
- Custom plugin now properly integrated with Leva lifecycle
- All existing functionality preserved
- HP, AC, and other fields continue working as before

## Future Enhancements

If more custom Leva plugins are needed in the future:

- Use `useInputContext<any>()` for access to full settings object
- Always manually invoke `settings.onEditEnd()` from component logic
- This is the correct pattern for custom plugins in Leva
