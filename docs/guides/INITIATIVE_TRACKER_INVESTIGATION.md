# Initiative Tracker Investigation

**Status**: Code exists, but not displaying in local/Docker versions

## What Exists in Codebase ✅

### Frontend Components

- ✅ `src/dm-area/initiative-tracker.tsx` - Main DM control panel
- ✅ `src/dm-area/initiative-tracker-view.tsx` - Read-only player view
- ✅ Button in toolbar: `src/dm-area/dm-map.tsx` (line ~971)
  - Dice icon with "Initiative" label
  - Calls `props.onShowInitiativeTracker?.()` when clicked

### Backend GraphQL

- ✅ Query: `combatState(mapId: String!)` - Get current combat state
- ✅ Mutation: `startCombat(mapId: String!)` - Start combat
- ✅ Mutation: `advanceInitiative(mapId: String!)` - Advance turn
- ✅ Mutation: `setInitiative(input: SetInitiativeInput!)` - Set token initiative
- ✅ Database functions: `startCombat()`, `advanceInitiative()`, `getCombatState()`

### Data Types

- ✅ `CombatState` type in GraphQL schema (token-data.ts)
- ✅ `Initiative` entries with `initiativeValue`, `isActive`, `orderIndex`
- ✅ Token stats include `initiativeModifier` field

---

## Why It's Not Showing

### Possibilities

1. **Button is Hidden by UI Layout**

   - The button exists but might be off-screen or not visible
   - Check if `<Toolbar>` group is displaying all buttons

2. **Component Not Rendering**

   - The `InitiativeTracker` component exists in JSX but might not be mounted
   - Check if `showInitiativeTracker` state is working

3. **GraphQL Query Failing Silently**

   - Query might be failing without visible error
   - Check browser DevTools Network tab for GraphQL errors

4. **Build/Deployment Issue**
   - Docker image might be using older build
   - Local version might need rebuild: `npm run build`

---

## How to Debug

### Step 1: Check DM Area Toolbar

1. Open DM view
2. Look at the toolbar on the right side of the map
3. You should see buttons: Media Library, Notes, **Initiative**
4. **Is the Initiative button visible?**

### Step 2: If Button Not Visible

Run this in browser console (DM area):

```javascript
// Check if button exists in DOM
document.querySelector('[aria-label*="Initiative"]');
// or search for "Initiative" text
document.body.innerText.includes("Initiative");
```

### Step 3: If Button Visible, Check Click Handler

1. Click the Initiative button
2. Open DevTools → Console
3. Look for errors
4. Check Network tab → GraphQL
5. Look for `initiativeTrackerCombatStateQuery` request

### Step 4: Check GraphQL Query

In DevTools Network tab, find the GraphQL request and check:

```json
{
  "operationName": "initiativeTrackerCombatStateQuery",
  "query": "query initiativeTrackerCombatStateQuery($mapId: String!) @live { ... }",
  "variables": { "mapId": "..." }
}
```

**If request fails**, check response for errors like:

- `"Cannot query field 'combatState'"`
- `"Cannot query field 'initiatives'"`

---

## Solution Options

### Option 1: Quick Fix - Rebuild

```bash
npm run build
npm run start:frontend:dev  # or Docker rebuild
```

### Option 2: If Button Missing - Check UI Rendering

The button should be in `src/dm-area/dm-map.tsx` lines 968-975. If it's not rendering:

1. Check if `Toolbar.Item` is properly imported
2. Verify `Icon.Dice` exists (used for the icon)
3. Make sure the conditional render logic isn't hiding it

### Option 3: If GraphQL Query Fails

Check if mutations exist on backend:

```bash
npm run start:server:dev
# Server logs should show mutation/query registrations
```

---

## Expected Behavior (When Working)

1. **DM clicks Initiative button** → Window opens
2. **Window shows**:

   - Toggle "Start Combat" / "In Combat"
   - List of tokens with initiative values
   - "Advance Initiative" button
   - Set initiative values for each token

3. **Players see** (in player-area):
   - Read-only initiative tracker showing current turn
   - Color-coded active token

---

## Next Steps

1. ✅ **Identify the problem**:

   - [ ] Button not visible in toolbar
   - [ ] Button visible, click does nothing
   - [ ] GraphQL query returns error
   - [ ] Other?

2. ✅ **Report finding** with:

   - Browser console errors (if any)
   - GraphQL request/response from Network tab
   - Screenshot of what you see

3. ✅ **Then fix** accordingly

---

## Related Files

| File                                      | Purpose                         |
| ----------------------------------------- | ------------------------------- |
| `src/dm-area/initiative-tracker.tsx`      | DM control panel                |
| `src/dm-area/initiative-tracker-view.tsx` | Player read-only view           |
| `src/dm-area/dm-map.tsx`                  | Toolbar with Initiative button  |
| `src/dm-area/token-stats-panel.tsx`       | Token initiative modifier field |
| `server/graphql/modules/token-data.ts`    | GraphQL mutations & queries     |
| `server/token-data-db.ts`                 | Database layer                  |
| `type-definitions.graphql`                | GraphQL schema definitions      |

---

## Code References

### Button Location

`src/dm-area/dm-map.tsx:968-975`

```tsx
<Toolbar.Item isActive>
  <Toolbar.Button
    onClick={() => {
      props.onShowInitiativeTracker?.();
    }}
  >
    <Icon.Dice boxSize="20px" />
    <Icon.Label>Initiative</Icon.Label>
  </Toolbar.Button>
</Toolbar.Item>
```

### Backend Query

`server/graphql/modules/token-data.ts:381-391`

```typescript
{
  name: "combatState",
  type: t.NonNull(GraphQLCombatStateType),
  args: { mapId: t.arg(t.NonNull(t.String)) },
  resolve: ({ context, args }) =>
    RT.run(
      RT.fromTask(() => tokenDataDb.getCombatState(context.db, args.mapId))
    )(context),
}
```

---

## Summary

✅ **Feature is fully implemented** in both frontend and backend  
❌ **But it's not displaying or working** in your local/Docker versions

**Most likely causes**:

1. Build cache issue → `npm run build`
2. Docker image outdated → Rebuild Docker image
3. UI rendering issue → Check browser console
4. GraphQL query failing → Check Network tab in DevTools

**Likely fix**: Try `npm run build` and redeploy.
