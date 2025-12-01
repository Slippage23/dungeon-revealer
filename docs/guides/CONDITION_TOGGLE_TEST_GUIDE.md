# 🧪 Condition Toggle Test Guide - Session 12

## Environment Status ✅

- Backend: Running on http://localhost:3000 (port 3000)
- Frontend: Running on http://localhost:4000 (port 4000)
- Browser: Open at http://localhost:4000/dm
- WebSocket: Connected and authenticated as DM

---

## Test Procedure

### Step 1: Verify Page Load

- Browser should display the DM area with map and tokens
- No console errors should appear
- You should see tokens on the map

### Step 2: Select a Token

1. Click on any token on the map (e.g., the goblin or other visible tokens)
2. The token should highlight/select
3. The Leva panel should appear in the bottom right corner

### Step 3: Open Browser DevTools

1. Press **F12** or right-click → Inspect
2. Go to **Network** tab (to watch GraphQL mutations)
3. Go to **Console** tab (to check for errors)
4. You'll watch for GraphQL mutations when you toggle conditions

### Step 4: Test Condition Toggle

**In the Leva Panel**:

1. Scroll down in the Leva panel to find the **Conditions** section
2. You should see colorful badge buttons for conditions:

   - Blinded (gray)
   - Charmed (pink)
   - Deafened (gray)
   - Exhausted (yellow)
   - Frightened (purple)
   - And more...

3. **Click on a condition badge** (e.g., "Blinded")
   - The badge should highlight/turn solid
   - You're now toggling the condition ON

### Step 5: Watch the Network Tab

When you click the condition:

1. **Network Tab** should show a GraphQL mutation being sent
2. In the mutation payload, look for:
   ```json
   {
     "condition": "BLINDED" // ✅ UPPERCASE (CORRECT)
   }
   ```

**IMPORTANT**: Should NOT show:

```json
{
  "condition": "blinded" // ❌ lowercase (OLD BUG)
}
```

### Step 6: Check for Errors

**In the Console Tab**:

- ✅ **GOOD**: No GraphQL validation errors
- ❌ **BAD**: Error message like:
  ```
  Value "blinded" does not exist in "TokenCondition" enum. Did you mean "BLINDED"?
  ```

### Step 7: Verify UI Feedback

After clicking:

1. The condition badge should visually change (highlight/color)
2. The condition should "stick" - remain toggled
3. Try clicking again to toggle OFF
4. The badge should return to outline/inactive state

### Step 8: Test Multiple Conditions

Try toggling several different conditions:

- Blinded
- Charmed
- Poisoned
- Exhausted

**Expected**: All should toggle without errors, badges should show which are active

---

## Success Criteria ✅

### Required for PASS:

1. ✅ Condition badges appear in Leva panel
2. ✅ Clicking condition badge toggles it (highlights/unhighlights)
3. ✅ Network tab shows GraphQL mutation with `condition: "UPPERCASE"`
4. ✅ NO errors in console
5. ✅ NO "does not exist in TokenCondition enum" error
6. ✅ Multiple conditions can be toggled

### If ANY of these fail ❌

The fix didn't work. Check:

- Is the leva-plugin-conditions.tsx file using UPPERCASE in the CONDITIONS array?
- Did the frontend rebuild correctly?
- Are there any TypeScript compilation errors?

---

## What We Fixed

**The Problem**:

- Leva plugin was sending lowercase condition names ("blinded" instead of "BLINDED")
- GraphQL schema expects UPPERCASE enum names
- Result: GraphQL validation error

**The Fix**:

- Changed CONDITIONS array from lowercase to UPPERCASE
- Removed .toLowerCase() from handleToggle function
- Frontend now sends UPPERCASE to match GraphQL enum

---

## Additional Testing (Optional)

### Test 1: Check Browser DevTools Network

1. Right-click on the GraphQL mutation
2. Copy request JSON
3. Paste into a text editor
4. Search for "condition":
   - Should find: `"condition": "BLINDED"` (or other uppercase condition)

### Test 2: Check Server Logs

While you toggle conditions, watch the backend server terminal:

1. Should see GraphQL queries being processed
2. Should see token data being updated
3. Should see live query invalidation messages

### Test 3: Verify Condition Persistence

1. Toggle a condition ON (e.g., "Blinded")
2. Click elsewhere to deselect the token
3. Click the token again to reselect
4. **Expected**: The condition should STILL be active
5. This tests that conditions are being saved to the database

---

## Expected Console Messages

### Good Output 🟢

```
[GraphQL MapToken] tokenData resolver called
[GraphQL] conditions resolver returning: ["blinded"]
```

### Bad Output 🔴

```
Value "blinded" does not exist in "TokenCondition" enum. Did you mean "BLINDED"?
```

---

## Next Steps After Testing

1. If ✅ **PASS**: Session 12 is complete and conditions work!
2. If ❌ **FAIL**: Need to debug leva-plugin-conditions.tsx changes

---

## Quick Reference

**Servers Running**:

- Backend: Port 3000 ✅
- Frontend: Port 4000 ✅
- Browser: http://localhost:4000/dm ✅

**File Changed**:

- src/leva-plugin/leva-plugin-conditions.tsx

**Test Location**:

- Leva Panel → Conditions section (bottom right)

**What to Watch**:

- Browser console for errors
- Network tab for GraphQL mutations
- Badge visual feedback when toggling

Good luck with testing! 🎯
