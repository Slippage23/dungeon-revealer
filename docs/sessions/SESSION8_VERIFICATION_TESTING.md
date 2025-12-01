# Session 8: Phase 1 Verification & Testing

**Date:** November 17, 2025  
**Objective:** Verify the conditions fix is working correctly  
**Status:** Testing in progress

---

## Test Environment

- **Backend:** Running on http://127.0.0.1:3000
- **Frontend:** Running on http://127.0.0.1:4000 (proxied to backend)
- **Build Hash:** `map-view.16a5477b.js` ✅ (with conditions fix)
- **Application:** Loaded at http://127.0.0.1:4000/dm

---

## Test Protocol

### Test 1: Verify Conditions UI Renders ✅

**Expected:** Leva control panel shows condition badges when token is selected

**Steps:**

1. ✅ App loaded successfully
2. ✅ Backend logs show token data being fetched
3. ✅ Token data includes `conditions: []` (empty array)
4. 🔄 **NEXT:** Select a token in the map
   - Look for Leva panel on the right side
   - Should show: currentHp, maxHp, tempHp, armorClass, conditions badges
   - Condition badges should be visible but not highlighted (no active conditions)

### Test 2: Toggle Single Condition ⏳

**Expected:** Clicking a condition badge sends mutation with conditions field

**Steps:**

1. With token selected
2. Click "BLINDED" badge in Leva panel
3. Badge should highlight (solid background)
4. **Check Backend Logs:**
   - Should see: `[GraphQL upsertTokenData] Called with input: { ..., conditions: ["BLINDED"] }`
   - ✅ If conditions field is present → Fix is working
   - ❌ If conditions field is missing → Mutation handler not fixed
5. Repeat with "RESTRAINED" badge

### Test 3: Edit HP While Conditions Active ⏳

**Expected:** Editing HP preserves conditions (NOT lost)

**Steps:**

1. Verify "BLINDED" condition is active (badge highlighted)
2. In Leva panel, edit currentHp to a different value (e.g., 50)
3. **Check Backend Logs:**
   - Should see mutation with BOTH:
     - `currentHp: 50` (the new value)
     - `conditions: ["BLINDED"]` (preserved from before)
   - ✅ If both present → Fix is working (conditions preserved)
   - ❌ If conditions missing → Bug still exists
4. Refresh page and verify "BLINDED" is still active (persisted to database)

### Test 4: Multiple Simultaneous Conditions ⏳

**Expected:** Can have 2+ conditions active at same time

**Steps:**

1. Toggle "BLINDED" → Badge highlights
2. Toggle "RESTRAINED" → Second badge highlights
3. Both badges should be highlighted simultaneously
4. Edit HP to 40
5. **Check Backend Logs:**
   - Should see: `conditions: ["BLINDED", "RESTRAINED"]`
6. Refresh page → Both conditions should still be active

### Test 5: Remove Condition ⏳

**Expected:** Un-clicking condition removes it

**Steps:**

1. With "BLINDED" and "RESTRAINED" both active
2. Click "BLINDED" badge again to toggle off
3. "BLINDED" badge should no longer be highlighted
4. "RESTRAINED" badge should still be highlighted
5. **Check Backend Logs:**
   - Should see: `conditions: ["RESTRAINED"]` (BLINDED removed)

---

## Success Criteria

| Test                       | Status | Criteria                                       |
| -------------------------- | ------ | ---------------------------------------------- |
| 1. UI Renders              | 🔄     | Condition badges visible in Leva panel         |
| 2. Single Condition Toggle | ⏳     | Backend logs show conditions in mutation input |
| 3. HP + Conditions         | ⏳     | Conditions preserved when editing HP           |
| 4. Multiple Conditions     | ⏳     | Can toggle multiple simultaneously             |
| 5. Remove Condition        | ⏳     | Can untoggle conditions                        |

---

## Backend Log Monitoring

Watch for these log patterns:

### ✅ Good (Fix Working):

```
[GraphQL upsertTokenData] Called with input: {
  tokenId: '2a4285fc-d4f2-4775-8d66-ef7cafedb931',
  mapId: '21dc4ebc-923a-4aa0-9f98-b2e184140a2d',
  currentHp: 50,
  maxHp: 100,
  tempHp: 0,
  armorClass: 10,
  conditions: ["BLINDED"]  // ✅ CONDITIONS FIELD PRESENT
}
```

### ❌ Bad (Bug Still Exists):

```
[GraphQL upsertTokenData] Called with input: {
  tokenId: '2a4285fc-d4f2-4775-8d66-ef7cafedb931',
  mapId: '21dc4ebc-923a-4aa0-9f98-b2e184140a2d',
  currentHp: 50,
  maxHp: 100,
  tempHp: 0,
  armorClass: 10
  // ❌ NO CONDITIONS FIELD!
}
```

---

## Troubleshooting

### Conditions badges not showing

- Clear browser cache (DevTools → Network → Disable cache)
- Hard refresh: Ctrl+Shift+R
- Check that map-view.16a5477b.js is being served (DevTools → Sources)

### Mutations not being sent

- Check browser Console for GraphQL errors
- Verify token is actually selected (should show Leva panel)
- Check backend is receiving WebSocket connection

### Conditions persisting before but lost now

- This would indicate a regression
- Check if mutations are still sending conditions
- Verify database update is correct

---

## Expected Phase 1 Completion Outcome

**If all tests pass:**

- ✅ Multi-condition support fully working
- ✅ Real-time mutations with complete field sets
- ✅ Conditions persist across HP/AC edits
- ✅ Multiple simultaneous conditions supported
- ✅ Phase 1 marked as 100% COMPLETE

**Next Step:** Begin Phase 2 - Enhanced Note System

---

## Test Execution Timeline

- 🟢 Application started: 13:05 UTC
- 🔄 Test 1 (UI Render): In progress
- ⏳ Test 2-5: Awaiting execution

---
