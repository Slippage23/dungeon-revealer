# Quick Damage/Healing Buttons - Feature Test Guide

## Quick Summary

A new set of quick-action buttons has been added to the token stats control panel in the DM Area. These buttons allow DMs to apply common HP adjustments instantly:

- **-5 HP**: Reduce HP by 5 (minimum 0)
- **-1 HP**: Reduce HP by 1 (minimum 0)
- **+1 HP**: Increase HP by 1 (maximum = maxHp)
- **+5 HP**: Increase HP by 5 (maximum = maxHp)

## Prerequisites for Testing

1. **Dungeon Revealer** running locally
2. **Backend server**: `npm run start:server:dev` on port 3000
3. **Frontend dev server**: `npm run start:frontend:dev` on port 4000 (or 4001 if 4000 is in use)
4. **Browser**: Access `http://localhost:4000/dm` (or the port shown)
5. **Test token**: Load the default map with tokens that have token data

## Location in UI

1. Open the DM Area
2. Click on a token to select it
3. Look at the **Leva control panel** (right side)
4. Find the **Combat Stats** section (looks like: `---combatStats`)
5. The quick buttons appear **above** the manual "Current HP" field

```
[Button Group - Combat Stats]
  -5 HP  | -1 HP  | +1 HP  | +5 HP
[Manual Editor]
  Current HP: [value]
  Max HP: [value]
```

## Test Cases

### Test 1: Damage Buttons

**Objective**: Verify damage buttons reduce HP correctly

**Setup**:

- Select a token with current HP > 5
- Verify initial HP in Leva panel

**Steps**:

1. Click the **"-5 HP"** button
2. Observe HP in panel decreases by 5
3. Check database updated (backend logs should show mutation)
4. Click **"-1 HP"** button once
5. Verify HP decreased by 1 from previous value

**Expected Results**:

- ✅ HP decreases immediately in Leva panel
- ✅ HP values clamped at minimum 0
- ✅ Backend logs show `[GraphQL upsertTokenData]` with new currentHp
- ✅ Database reflects new value (check `data/db.sqlite` token_data table)

**Pass Criteria**:

- HP reductions work correctly
- UI updates instantly
- Backend receives mutation with correct values

---

### Test 2: Healing Buttons

**Objective**: Verify healing buttons increase HP correctly

**Setup**:

- Select a token with current HP < maxHp
- Note both current and max HP values

**Steps**:

1. Click the **"+1 HP"** button
2. Observe HP in panel increases by 1
3. Click **"+5 HP"** button
4. Observe HP increases by 5 (or stops at maxHp if it would exceed)

**Expected Results**:

- ✅ HP increases immediately in Leva panel
- ✅ HP never exceeds maxHp
- ✅ Healing buttons are disabled or non-functional if HP == maxHp
- ✅ Backend logs show mutations with correct values

**Pass Criteria**:

- Healing works correctly
- HP clamped at maxHp
- UI responds instantly

---

### Test 3: Clamp at Boundaries

**Objective**: Verify HP stays within 0 to maxHp range

**Setup**:

- Select a token
- Get its maxHp value

**Test 3a: Minimum Boundary**

- Reduce HP to 0 using damage buttons
- Click "-5 HP" when HP is 0
- Expected: ✅ HP remains at 0

**Test 3b: Maximum Boundary**

- Increase HP to maxHp using healing buttons
- Click "+5 HP" when HP == maxHp
- Expected: ✅ HP remains at maxHp

---

### Test 4: Conditions Preservation

**Objective**: Verify conditions survive HP mutations

**Setup**:

- Select a token with conditions already set (e.g., "unconscious", "restrained")
- Note conditions in Leva panel

**Steps**:

1. Click any damage/healing button
2. Observe conditions remain unchanged

**Expected Results**:

- ✅ Conditions appear exactly the same
- ✅ No conditions added or removed
- ✅ Backend mutation preserves conditions array

**Pass Criteria**:

- Conditions unchanged after HP adjustment

---

### Test 5: Other Fields Preservation

**Objective**: Verify armorClass and other fields survive mutations

**Setup**:

- Select a token
- Note: armorClass, tempHp, maxHp, notes

**Steps**:

1. Click a quick button
2. Check all other fields remain the same

**Expected Results**:

- ✅ armorClass unchanged
- ✅ tempHp unchanged
- ✅ maxHp unchanged
- ✅ notes unchanged
- ✅ speed unchanged
- ✅ initiativeModifier unchanged

**Pass Criteria**:

- All non-HP fields preserved

---

### Test 6: Manual HP Editor Still Works

**Objective**: Verify quick buttons don't break manual HP editing

**Setup**:

- Select a token
- Use a quick button to change HP

**Steps**:

1. Manually edit the "Current HP" field below buttons
2. Type a new value and press Enter
3. Verify it updates

**Expected Results**:

- ✅ Manual editing still works
- ✅ No conflicts between buttons and manual editor

**Pass Criteria**:

- Both input methods work correctly

---

### Test 7: Multiple Tokens

**Objective**: Verify buttons work on different tokens

**Setup**:

- Select token A, click "-5 HP"
- Select token B, click "+5 HP"

**Expected Results**:

- ✅ Token A HP decreased
- ✅ Token B HP increased
- ✅ No cross-contamination
- ✅ Each has own token data

**Pass Criteria**:

- Buttons work independently for each token

---

### Test 8: Real-time Updates

**Objective**: Verify player clients see HP changes

**Setup**:

- Open player area in another browser window
- Select a token and apply damage

**Expected Results**:

- ✅ Player area updates in real-time
- ✅ HP changes visible to all connected clients
- ✅ Live query invalidation working

**Pass Criteria**:

- Updates propagate to players

---

## Browser Developer Tools Checks

### Check 1: Network Tab

After clicking a button:

1. Open DevTools → Network tab
2. Look for a GraphQL mutation (WebSocket message)
3. Verify the payload contains:
   ```json
   {
     "variables": {
       "input": {
         "tokenId": "...",
         "mapId": "...",
         "currentHp": <new_value>,
         "conditions": [...]
       }
     }
   }
   ```

### Check 2: Backend Logs

1. Open backend terminal (running `npm run start:server:dev`)
2. Look for after clicking button:
   ```
   [GraphQL upsertTokenData] Called with full input: {...}
   ```
3. Verify currentHp matches expected value
4. Verify conditions preserved

### Check 3: Database

After any button click:

```bash
# Check token_data table
sqlite3 data/db.sqlite
sqlite> SELECT id, token_id, current_hp, conditions FROM token_data;
```

Verify `current_hp` matches UI and `updated_at` timestamp is recent.

---

## Troubleshooting

### Buttons Don't Appear

- Check Leva panel loaded (should see other token controls)
- Check browser console for errors
- Verify `src/map-view.tsx` contains the buttonGroup code (lines 568-577)

### Buttons Don't Change HP

- Check backend is running
- Check browser console for GraphQL errors
- Verify backend logs show mutation being called
- Check database has token_data entry for this token

### HP Reverts After Clicking

- Check database connection
- Check `upsertTokenData` mutation in backend logs
- Look for error messages in backend console

### Conditions Disappear After Clicking

- This is a bug! Report it
- Expected: Conditions should always be preserved
- Check backend mutation preserves conditions field

### Multiple Tokens Not Working

- Verify each token has unique `token.id`
- Check `mapId` is correct
- Look for token ID mismatches in backend logs

---

## Success Criteria Summary

| Aspect                      | Expected                  | Status |
| --------------------------- | ------------------------- | ------ |
| Damage buttons reduce HP    | -5 HP, -1 HP work         | ?      |
| Healing buttons increase HP | +1 HP, +5 HP work         | ?      |
| HP clamped at 0             | Cannot go below 0         | ?      |
| HP clamped at maxHp         | Cannot exceed maxHp       | ?      |
| Conditions preserved        | Unchanged after click     | ?      |
| Other fields preserved      | armorClass, etc preserved | ?      |
| UI updates instantly        | No delay observed         | ?      |
| Backend receives mutation   | Logs show call            | ?      |
| Database updates            | New HP persisted          | ?      |
| Works on multiple tokens    | Each token independent    | ?      |
| Manual editor still works   | Can edit HP manually      | ?      |
| Real-time updates           | Players see changes       | ?      |

---

## Notes for Testing

1. **Order of Operations**:

   - UI update (instant)
   - GraphQL mutation sent
   - Backend processes
   - Database updates
   - Live query invalidation
   - All clients updated

2. **Expected Latency**:

   - UI response: instant (optimistic update via Relay)
   - Backend roundtrip: <100ms typically
   - Player update: depends on WebSocket latency

3. **Data Flow**:

   ```
   Click Button
     ↓
   handleDamage/handleHealing callback
     ↓
   useMutation sends GraphQL
     ↓
   Backend upsertTokenData resolver
     ↓
   Database insert/update
     ↓
   Live query invalidation
     ↓
   All clients receive update
   ```

4. **Fallback**:
   If buttons don't work, manual HP editor (below buttons) still works as fallback

---

## Test Sign-Off

When all tests pass, mark the feature as **READY FOR PRODUCTION**.

**Tester**: ********\_\_\_********  
**Date**: ********\_\_\_********  
**Notes**: ********\_\_\_********

---

**Feature**: Quick Damage/Healing Buttons  
**Build**: Frontend ✅ | Backend ✅  
**Status**: Ready for User Testing
