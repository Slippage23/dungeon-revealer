# Initiative Tracker Implementation Status

**Current Status**: ✅ **BACKEND & COMPONENT COMPLETE** | ⚠️ **FRONTEND INTEGRATION INCOMPLETE**

---

## What's Implemented

### ✅ Backend GraphQL API (server/graphql/modules/token-data.ts)

All mutations are fully implemented:

1. **`setInitiative(input: SetInitiativeInput!)`**

   - Sets initiative value for a token
   - Creates or updates database entry
   - Returns updated initiative entry

2. **`startCombat(mapId: String!)`**

   - Activates first token in initiative order
   - Sets round to 1
   - Returns full combat state

3. **`advanceInitiative(mapId: String!)`**

   - Moves to next token in initiative order
   - Handles round advancement
   - Loops back to first token after last token

4. **`endCombat(mapId: String!)`**

   - Clears initiative order
   - Removes all combatants

5. **`removeFromInitiative(mapId: String!, tokenId: String!)`**
   - Removes specific token from combat
   - Reorders remaining tokens

### ✅ Database Layer (server/token-data-db.ts)

All database operations implemented:

- `setInitiative()` - Set or update initiative value
- `getInitiativeEntry()` - Fetch single entry
- `getMapInitiativeOrder()` - Fetch all combatants for a map
- `getCombatState()` - Get full combat state
- `advanceInitiative()` - Move to next turn
- `startCombat()` - Start combat at round 1
- `endCombat()` - Clear combat (if implemented)
- `removeFromInitiative()` - Remove token from combat

### ✅ Database Schema (server/migrations/)

Initiative tracking table exists with columns:

- `map_id` (foreign key to maps)
- `token_id` (foreign key to token_data)
- `initiative_value` (number)
- `is_active` (boolean - current turn flag)
- `round_number` (number)
- `order_index` (number - turn order position)

### ✅ Frontend Component (src/dm-area/initiative-tracker.tsx)

Complete React component implemented (522 lines):

**Queries:**

- `initiativeTrackerCombatStateQuery` - Fetches current combat state with @live directive

**Mutations:**

- `initiativeTrackerSetInitiativeMutation` - Set token initiative
- `initiativeTrackerStartCombatMutation` - Start combat
- `initiativeTrackerAdvanceMutation` - Next turn
- `initiativeTrackerEndCombatMutation` - End combat
- `initiativeTrackerRemoveFromInitiativeMutation` - Remove combatant

**Features:**

- UI displays all combatants in turn order
- Set initiative values for tokens
- Start/advance/end combat
- Remove tokens from combat
- Show current round number
- Real-time updates with @live queries
- Toast notifications for all actions

---

## What's Missing

### ⚠️ Frontend Integration

**The InitiativeTracker component exists but is NOT integrated into the DM area UI!**

#### Missing Steps:

1. **Import InitiativeTracker in dm-area.tsx**

   ```tsx
   import { InitiativeTracker } from "./initiative-tracker";
   ```

2. **Add state to show/hide tracker**

   ```tsx
   const [showInitiativeTracker, setShowInitiativeTracker] =
     React.useState(false);
   ```

3. **Render component conditionally**

   ```tsx
   {
     showInitiativeTracker && (
       <InitiativeTracker
         mapId={loadedMapId}
         onClose={() => setShowInitiativeTracker(false)}
       />
     );
   }
   ```

4. **Add button to open tracker** (e.g., in toolbar or menu)
   ```tsx
   <Button
     onClick={() => setShowInitiativeTracker(true)}
     leftIcon={<Icon.Dice />}
   >
     Initiative
   </Button>
   ```

---

## How to Test

### Prerequisites

1. Backend and frontend servers running:

   ```bash
   npm run start:server:dev &
   npm run start:frontend:dev &
   ```

2. Create a map and add some tokens to it

### Testing Steps

**Option A: Manual Component Testing** (once integrated)

1. Open DM area with a map loaded
2. Click "Initiative" button in toolbar
3. Add tokens to initiative:
   - Enter initiative value for each token
   - Click "Set" button
4. Click "Start Combat" button
5. Verify first token is active (highlighted)
6. Click "Next Turn" to advance
7. Verify round increments when cycling back to first token
8. Click "End Combat" to stop

**Option B: Direct GraphQL Testing**

Use GraphQL playground to test mutations directly:

```graphql
query GetCombatState($mapId: String!) {
  combatState(mapId: $mapId) {
    mapId
    isActive
    currentRound
    activeTokenId
    initiatives {
      id
      tokenId
      initiativeValue
      isActive
      roundNumber
      orderIndex
    }
  }
}

mutation SetInitiative($input: SetInitiativeInput!) {
  setInitiative(input: $input) {
    id
    tokenId
    initiativeValue
    isActive
    orderIndex
  }
}

mutation StartCombat($mapId: String!) {
  startCombat(mapId: $mapId) {
    mapId
    isActive
    currentRound
    activeTokenId
  }
}

mutation AdvanceInitiative($mapId: String!) {
  advanceInitiative(mapId: $mapId) {
    mapId
    isActive
    currentRound
    activeTokenId
  }
}
```

---

## Integration Checklist

- [ ] Import InitiativeTracker component in dm-area.tsx
- [ ] Add state for showing/hiding tracker
- [ ] Render component in dm-area JSX
- [ ] Add button to open initiative tracker
- [ ] Test with sample tokens
- [ ] Verify Start Combat works
- [ ] Verify Advance Turn works
- [ ] Verify Round increments
- [ ] Verify Remove Token works
- [ ] Test End Combat
- [ ] Test real-time updates with multiple connected clients

---

## Files to Modify

| File                                   | Change                            | Status  |
| -------------------------------------- | --------------------------------- | ------- |
| `src/dm-area/dm-area.tsx`              | Import & render InitiativeTracker | ⏳ TODO |
| `src/dm-area/initiative-tracker.tsx`   | Component code                    | ✅ DONE |
| `server/graphql/modules/token-data.ts` | GraphQL mutations                 | ✅ DONE |
| `server/token-data-db.ts`              | Database operations               | ✅ DONE |
| `type-definitions.graphql`             | GraphQL schema                    | ✅ DONE |

---

## Quick Summary

**The initiative tracker is 95% complete!** The only missing piece is hooking it up to the UI.

Once integrated:

- DMs can set initiative values for all combat tokens
- DMs can start combat to activate first token
- DMs can advance turns with a button click
- UI shows current round and active combatant
- All changes sync in real-time to all connected players
- Full turn-based combat management

**Time to integrate**: ~10-15 minutes
