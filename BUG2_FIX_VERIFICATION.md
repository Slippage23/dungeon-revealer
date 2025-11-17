# Bug 2 Fix Verification Report

## Issue Summary

**Problem**: Token conditions were being cleared when users edited token stats through the Leva panel.

**Root Cause**: The `handleSave()` function in `token-stats-panel.tsx` was not passing conditions when calling the `upsertTokenData` GraphQL mutation.

**Previous State**: When users edited token stats (HP, AC, Speed, Initiative), the mutation would send an update without the `conditions` field, causing the server to reset conditions to an empty array.

## Fix Applied

**File Modified**: `src/dm-area/token-stats-panel.tsx`

### Changes Made:

1. **Added cachedConditions state** (line 188):

   ```tsx
   const [cachedConditions, setCachedConditions] = React.useState<string[]>([]);
   ```

   - Tracks the current conditions locally in the component

2. **Initialize cachedConditions in useEffect** (line 200):

   ```tsx
   setCachedConditions(data.tokenData.conditions || []);
   ```

   - When query data loads, sync cachedConditions with server data

3. **Pass conditions in handleSave** (line 226):

   ```tsx
   conditions: cachedConditions, // ✅ PRESERVE CONDITIONS
   ```

   - Now includes conditions when saving token stats via Leva panel

4. **Optimistic update in handleToggleCondition** (lines 283-289):
   ```tsx
   const newConditions = cachedConditions.includes(normalizedCondition)
     ? cachedConditions.filter((c) => c !== normalizedCondition)
     : [...cachedConditions, normalizedCondition];
   setCachedConditions(newConditions);
   ```
   - Immediately updates local state when user toggles a condition
   - Provides instant UI feedback while server processes mutation

## How to Verify the Fix

### Test 1: Condition Persists After Stat Edit

**Steps:**

1. Open DM area and select a token
2. In the Token Stats panel, toggle a condition ON (click a condition badge)
3. Verify the condition appears with the badge highlighted
4. Edit another field (e.g., AC or HP) in the Leva panel
5. Click the Save button
6. **Expected**: The condition should still be visible and active

**Previous Behavior**: Condition would disappear after save
**New Behavior**: Condition persists ✅

### Test 2: Quick Damage Buttons Preserve Conditions

**Steps:**

1. Select token with an active condition
2. Enter damage amount (e.g., 10)
3. Click "Damage" or "Heal" button
4. **Expected**: Condition should persist after HP update

**Note**: This was fixed in Phase 1 Bug 1 fix (applyDamage preserving conditions)

### Test 3: Multiple Conditions Preserved

**Steps:**

1. Toggle multiple conditions ON (e.g., charmed, incapacitated, poisoned)
2. Edit a stat in Leva panel
3. Save
4. **Expected**: All conditions should persist

### Test 4: Toggling Conditions On/Off

**Steps:**

1. Toggle a condition OFF (click to remove it)
2. Toggle it back ON
3. Edit another field and save
4. **Expected**: Condition state should be correctly preserved

## Code Flow Analysis

### Data Flow for Condition Preservation:

```
1. Component Load
   ├─ Query loads data.tokenData.conditions from server
   └─ useEffect: cachedConditions = data.tokenData.conditions

2. User Toggles Condition
   ├─ handleToggleCondition: cachedConditions updated optimistically
   ├─ toggleCondition mutation sent to server
   └─ Live query updates data.tokenData.conditions
      └─ useEffect syncs cachedConditions with new server data

3. User Edits Stat & Saves
   ├─ handleSave called
   ├─ upsertTokenData mutation sent WITH conditions: cachedConditions
   └─ Server updates token data preserving conditions ✅

4. User Closes & Reopens Panel
   ├─ New query loads
   └─ Conditions are persisted from database
```

## Related Bugs

### Bug 1 (Previously Fixed - Commit a1f973a)

- **Issue**: `applyDamage()` not preserving conditions
- **Fix**: Added `conditions: tokenData.conditions` in server mutation
- **Status**: ✅ FIXED

### Bug 2 (This Commit)

- **Issue**: `handleSave()` not passing conditions
- **Fix**: Added cachedConditions state tracking
- **Status**: ✅ FIXED

## Testing Commands

### Rebuild Frontend (if needed):

```bash
npm run build
```

### Start Development Servers:

```bash
npm run start:server:dev    # Terminal 1
npm run start:frontend:dev  # Terminal 2
```

### Access DM Area:

```
http://localhost:4000/dm
```

## Database State Verification

To manually verify conditions are stored correctly in database:

```sql
SELECT token_id, current_hp, conditions FROM token_data WHERE token_id='2a4285fc-d4f2-4775-8d66-ef7cafedb931';
```

**Expected output** (after toggling charmed, incapacitated, poisoned):

```
token_id: 2a4285fc-d4f2-4775-8d66-ef7cafedb931
current_hp: 90
conditions: ["charmed","incapacitated","poisoned"]
```

## Regression Prevention

To prevent similar issues in the future:

- Any field that modifies token data must explicitly pass all fields in the mutation
- Document required vs optional mutation fields
- Add tests for mutation field preservation
- Use TypeScript strict mode to catch missing fields

## Session Context

**Session**: Phase 2 Bug Investigation
**Discovery Date**: Nov 17, 2025, 19:10 UTC
**Root Cause Analysis**: Server logs showed conditions being stored then immediately cleared
**Fix Verification**: Code inspection + commit

## Next Steps

1. ✅ Commit Bug 2 fix
2. 🚧 Manual user testing of condition persistence
3. 🚧 Phase 2 GraphQL integration testing
4. 🚧 Full end-to-end testing of Phase 1 + Phase 2 features
