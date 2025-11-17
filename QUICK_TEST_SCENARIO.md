# Quick Test Scenario - Verify Both Bugs Are Fixed

## Quick Summary

Two bugs caused conditions to be cleared:

1. **Bug 1** - Quick damage/heal buttons cleared conditions (FIXED in server)
2. **Bug 2** - Leva panel stat edits cleared conditions (FIXED in frontend)

Both are fixed and ready to test!

---

## Test 1: Condition Persists When Editing Stats (Bug 2 - MAIN TEST)

**Time**: ~2 minutes

**Setup**:

- Open http://localhost:4000/dm
- Click on any token to open Token Stats panel
- The panel should show on the right side

**Steps**:

1. In the Conditions section, click on a condition badge to toggle it ON
   - Try: charmed, incapacitated, or poisoned
   - Badge should become highlighted/colored
2. Edit a different field (AC, HP, Speed, or Initiative)
   - Click in the field and change the value
   - Example: Change AC from 10 to 12
3. Click the "Save" button
   - Should show "Token saved successfully"
4. **VERIFY**: The condition should still be visible and highlighted
   - **BEFORE FIX**: Condition would disappear
   - **AFTER FIX**: Condition persists ✅

---

## Test 2: Quick Damage Button Preserves Conditions (Bug 1)

**Time**: ~1 minute

**Steps**:

1. With Token Stats panel open
2. In the "Quick Damage/Heal" section, enter an amount (e.g., 10)
3. Click the "Damage" button (or "Heal")
4. **VERIFY**: The condition should still be visible
   - **BEFORE FIX**: Condition would disappear
   - **AFTER FIX**: Condition persists ✅

---

## Test 3: Multiple Conditions (Comprehensive Test)

**Time**: ~3 minutes

**Steps**:

1. Toggle multiple conditions ON:

   - Click: charmed ✓
   - Click: incapacitated ✓
   - Click: poisoned ✓
   - All three badges should be highlighted

2. Edit multiple stats and save:

   - Change AC to 11
   - Change Speed to 30
   - Click Save

3. Apply some damage:

   - Enter 5 in damage field
   - Click Damage

4. **VERIFY**: All three conditions still visible
   - **BEFORE FIX**: Would lose conditions after any operation
   - **AFTER FIX**: All conditions persist through multiple operations ✅

---

## Test 4: Toggling Conditions On/Off (UI Test)

**Time**: ~1 minute

**Steps**:

1. Toggle a condition ON
2. Toggle it OFF
3. Toggle it back ON
4. Edit stats and save
5. **VERIFY**: Condition state is correct
   - Should show as ON since you toggled it back

---

## Expected Behavior After Fixes

✅ Conditions persist when editing token stats  
✅ Conditions persist when applying damage/healing  
✅ Conditions persist through multiple operations  
✅ Toggling conditions on/off works correctly  
✅ UI shows correct condition states

---

## Server Logs to Watch

Open terminal with server logs (`npm run start:server:dev`) and look for:

**When saving with conditions**:

```
[GraphQL upsertTokenData] Called with full input: {
  ...
  conditions: ["charmed","incapacitated"]  ← Should see conditions here
}
```

**After save, when querying token**:

```
[GraphQL] conditions resolver returning: ["charmed","incapacitated"]  ← Should NOT be empty
```

---

## Troubleshooting

**If conditions disappear after saving**:

1. Check browser console for errors (F12 → Console)
2. Check server logs for GraphQL errors
3. Verify frontend was rebuilt: `npm run build`
4. Verify servers were restarted
5. Try refreshing the page

**If test environment not working**:

```bash
# Kill all processes
Stop-Process -Name node -Force

# Rebuild
npm run build

# Restart servers
npm run start:server:dev    # Terminal 1
npm run start:frontend:dev  # Terminal 2
```

---

## Success Criteria

✅ **Test 1**: Condition persists after editing AC/HP/Speed/Initiative  
✅ **Test 2**: Condition persists after applying damage/healing  
✅ **Test 3**: Multiple conditions persist through multiple operations  
✅ **Test 4**: Toggle on/off maintains correct state

If all tests pass → **Both bugs are FIXED** ✅

---

## Sessions Completed

This testing validates that:

- Phase 1 condition system is fully operational
- Both server and client code paths preserve conditions
- Ready to proceed with Phase 2 GraphQL integration

🎉 **Once validated by user, Phase 2 work can resume!**
