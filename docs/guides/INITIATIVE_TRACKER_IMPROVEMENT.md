# Initiative Tracker - UX Improvement ✅

## What Changed

Implemented your suggested UX for the Initiative Tracker component in `src/dm-area/initiative-tracker.tsx`.

### Before

- ❌ Button existed but no way to assign tokens
- ❌ Could only edit existing initiatives
- ❌ No "add tokens" workflow

### After ✅

- ✅ **Top Section**: "Initiative Order"

  - Shows all tokens currently in initiative
  - Edit initiative values
  - Remove tokens (for dead/defeated)
  - Shows active turn indicator

- ✅ **Bottom Section**: "Available Tokens"
  - Shows all unassigned tokens on the map
  - Click "Add" button to assign initiative
  - Opens initiative input (defaults to 10)
  - Confirm to add to order above
  - Displays token color and label

### New Workflow

1. **Click Initiative button** in toolbar
2. **Initiative Tracker opens**
3. **In "Available Tokens" section**:
   - Click "Add" next to token you want to add
   - Enter initiative value (defaults to 10)
   - Click "Set" to add to initiative order
4. **In "Initiative Order" section**:
   - See all tokens ranked by initiative
   - Edit values inline
   - Remove tokens as needed
5. **Click "Start Combat"** to begin
6. **Click "Next Turn"** to advance

---

## Code Changes

### File Modified

`src/dm-area/initiative-tracker.tsx`

### Key Additions

1. **New GraphQL Query**: Fetch all tokens on the map

```typescript
query initiativeTrackerMapTokensQuery($mapId: ID!) {
  map(id: $mapId) {
    tokens {
      id
      label
      color
    }
  }
}
```

2. **Computed Unassigned Tokens**

```typescript
const allTokens = (mapData as any)?.map?.tokens || [];
const initiativeTokenIds = new Set(initiatives.map((i: any) => i.tokenId));
const unassignedTokens = allTokens.filter(
  (token: any) => !initiativeTokenIds.has(token.id)
);
```

3. **Two-Section Layout**
   - Initiative Order (top) - sorted by initiative value
   - Available Tokens (bottom) - tokens not yet assigned

---

## Test It

1. **Open** `http://localhost:4000/`
2. **Login as DM**
3. **Click Initiative button** in toolbar
4. **You should see**:
   - Empty initiative order (if no combat started)
   - All tokens in "Available Tokens" section
5. **Click "Add"** on a token
6. **Enter initiative value** and click "Set"
7. **Token moves** to Initiative Order section
8. **Repeat** for other tokens
9. **Click "Start Combat"** when ready

---

## Technical Details

- Uses Relay for GraphQL queries (type-safe)
- Computed filtered lists (unassigned = all - assigned)
- Inline editing with NumberInput
- Color-coded token indicators
- Responsive layout with proper spacing

---

## Status

✅ **Code modified and ready to test**  
✅ **Relay compiler ran**  
✅ **Frontend should hot-reload**  
✅ **Backend already has all mutations**

**Try it now!** The Initiative Tracker button in the toolbar should now show a usable interface for assigning tokens to initiative order.
