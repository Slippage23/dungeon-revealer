# Phase 1 - Quick Integration Guide

This guide helps you complete the remaining steps to integrate the Token Management system.

## Step 1: Generate GraphQL Schema (REQUIRED FIRST)

```bash
# Navigate to project root
cd C:\Temp\git\dungeon-revealer\dungeon-revealer

# Generate GraphQL schema
npm run write-schema

# Compile Relay queries (generates TypeScript types)
npm run relay-compiler
```

**What this does:**
- Reads all `graphql` tagged queries in the codebase
- Generates TypeScript types for each query/mutation
- Creates files like `tokenStatsPanelTokenDataQuery.graphql.ts`
- These types are imported in the React components

**Expected output:**
- Should see "Compiled X files" or similar
- Look for generated files in `src/**/__generated__/` directories

## Step 2: Run Database Migration

```bash
# Option A: Start dev server (auto-migrates)
npm run start:server:dev

# Option B: Build and run manually
npm run build:backend
node server-build/index.js
```

**Verify migration worked:**
```bash
# Open SQLite database
sqlite3 data/db.sqlite

# Check user_version (should be 5)
PRAGMA user_version;

# Check tables exist
.tables
# Should see: token_data, initiative_order

# Exit
.quit
```

## Step 3: Test GraphQL API

Open GraphiQL: http://localhost:3000/graphql

### Test Query: Token Data
```graphql
query {
  tokenData(tokenId: "test-token-123") {
    id
    tokenId
    currentHp
    maxHp
  }
}
```

### Test Mutation: Create Token Data
```graphql
mutation {
  upsertTokenData(input: {
    tokenId: "test-token-123"
    mapId: "test-map-1"
    currentHp: 25
    maxHp: 30
    tempHp: 5
    armorClass: 15
    conditions: [POISONED]
  }) {
    id
    currentHp
    conditions
  }
}
```

### Test Combat State
```graphql
mutation {
  setInitiative(input: {
    mapId: "test-map-1"
    tokenId: "test-token-123"
    initiativeValue: 18
  }) {
    id
    initiativeValue
  }
}

query {
  combatState(mapId: "test-map-1") {
    isActive
    initiatives {
      tokenId
      initiativeValue
    }
  }
}
```

## Step 4: Add Toolbar Buttons to DM Map

Edit `src/dm-area/dm-map.tsx`:

### 4a. Add imports at the top
```typescript
import { TokenStatsPanel } from "./token-stats-panel";
import { InitiativeTracker } from "./initiative-tracker";
```

### 4b. Add state for panels (inside DmMap component function)
```typescript
const [showTokenStats, setShowTokenStats] = React.useState(false);
const [selectedTokenId, setSelectedTokenId] = React.useState<string | null>(null);
const [showInitiative, setShowInitiative] = React.useState(false);
```

### 4c. Find the toolbar section and add buttons

Look for the toolbar with existing buttons (near `<Toolbar>` or button group).
Add these buttons:

```typescript
{/* Token Stats Button */}
<Tooltip label="Token Stats">
  <Button.Tertiary
    small
    iconOnly
    onClick={() => setShowTokenStats(!showTokenStats)}
  >
    <Icon.Heart boxSize="16px" />
  </Button.Tertiary>
</Tooltip>

{/* Initiative Tracker Button */}
<Tooltip label="Initiative Tracker">
  <Button.Tertiary
    small
    iconOnly
    onClick={() => setShowInitiative(!showInitiative)}
  >
    <Icon.List boxSize="16px" />
  </Button.Tertiary>
</Tooltip>
```

### 4d. Add panels to render (at the end of the component return, before final closing tags)

```typescript
{/* Token Stats Panel */}
{showTokenStats && selectedTokenId && (
  <TokenStatsPanel
    tokenId={selectedTokenId}
    mapId={map.id}
    onClose={() => {
      setShowTokenStats(false);
      setSelectedTokenId(null);
    }}
  />
)}

{/* Initiative Tracker */}
{showInitiative && (
  <InitiativeTracker
    mapId={map.id}
    onClose={() => setShowInitiative(false)}
  />
)}
```

### 4e. Wire up token click handler

Find where tokens are rendered on the map and add click handler.
You'll need to find the token rendering code (likely in map-view or a token component).

Example pattern to look for:
```typescript
// In token click handler
onClick={(tokenId) => {
  setSelectedTokenId(tokenId);
  setShowTokenStats(true);
}}
```

**Note:** The exact location depends on how tokens are currently rendered. 
Look for token rendering logic in `src/map-view.tsx` or related components.

## Step 5: Add HP Bars to Map (Optional but Recommended)

This adds visual HP bars above tokens on the map.

### Edit `src/map-view.tsx`

### 5a. Add query for token data
```typescript
// Add to imports
import graphql from "babel-plugin-relay/macro";
import { useQuery } from "relay-hooks";

// Add query near other queries
const MapView_TokenDataQuery = graphql`
  query mapViewTokenDataQuery($tokenId: String!) {
    tokenData(tokenId: $tokenId) {
      currentHp
      maxHp
      tempHp
      conditions
    }
  }
`;
```

### 5b. Create HP bar component
```typescript
const TokenHPBar = ({ tokenId }: { tokenId: string }) => {
  const { data } = useQuery(
    MapView_TokenDataQuery,
    { tokenId },
    { fetchPolicy: "store-and-network" }
  );

  if (!data?.tokenData?.maxHp) return null;

  const { currentHp, maxHp, tempHp } = data.tokenData;
  const hpPercentage = (currentHp / maxHp) * 100;
  const isLow = hpPercentage <= 25;

  return (
    <div
      style={{
        position: "absolute",
        top: -20,
        left: 0,
        right: 0,
        height: 4,
        backgroundColor: "#e2e8f0",
        borderRadius: 2,
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${hpPercentage}%`,
          backgroundColor: isLow ? "#f56565" : "#48bb78",
          borderRadius: 2,
          transition: "width 0.3s ease",
        }}
      />
      {tempHp > 0 && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: "100%",
            width: "100%",
            backgroundColor: "rgba(66, 153, 225, 0.5)",
          }}
        />
      )}
    </div>
  );
};
```

### 5c. Render HP bar above each token
Find where tokens are rendered and add:
```typescript
<TokenHPBar tokenId={token.id} />
```

## Step 6: Test the Integration

### Manual Test Checklist

1. **Start the application**
   ```bash
   npm run start:server:dev
   # In another terminal:
   npm run start:frontend:dev
   ```

2. **Open DM interface**
   - Navigate to http://localhost:3000
   - Log in as DM

3. **Test Token Stats Panel**
   - [ ] Click the Heart icon in toolbar
   - [ ] Token stats panel should appear
   - [ ] Set HP values (e.g., 20/25)
   - [ ] Click "Save Changes"
   - [ ] Should see success toast
   - [ ] Close and reopen - values should persist

4. **Test Quick Damage/Heal**
   - [ ] Enter "5" in damage field
   - [ ] Click "Damage" - HP should reduce by 5
   - [ ] Enter "3" in heal field  
   - [ ] Click "Heal" - HP should increase by 3

5. **Test Temp HP**
   - [ ] Set Temp HP to 10
   - [ ] Click Save
   - [ ] Apply 5 damage
   - [ ] Temp HP should reduce first (to 5)
   - [ ] Regular HP should stay the same

6. **Test Conditions**
   - [ ] Click "Poisoned" badge - should turn solid
   - [ ] Click "Stunned" badge - should turn solid
   - [ ] Click "Poisoned" again - should turn outline (toggle off)
   - [ ] Save changes
   - [ ] Reload - conditions should persist

7. **Test Initiative Tracker**
   - [ ] Click the List icon in toolbar
   - [ ] Initiative tracker should appear
   - [ ] Should show "No tokens in initiative order"

8. **Add Token to Initiative**
   - [ ] Create/select a token with token stats
   - [ ] Click "Edit" on the token in initiative list
   - [ ] Set initiative value (e.g., 18)
   - [ ] Click "Set"
   - [ ] Token should appear in list with initiative 18

9. **Test Combat Flow**
   - [ ] Add 2-3 tokens with different initiative values
   - [ ] Click "Start Combat"
   - [ ] First token (highest initiative) should be highlighted
   - [ ] Badge should show "Round 1"
   - [ ] Click "Next Turn"
   - [ ] Second token should become active
   - [ ] Click "Next Turn" until round advances
   - [ ] Badge should show "Round 2"

10. **Test End Combat**
    - [ ] Click "End Combat"
    - [ ] All tokens should be removed from initiative
    - [ ] Should show empty state message

11. **Test Persistence**
    - [ ] Set token HP and conditions
    - [ ] Refresh browser
    - [ ] Reopen token stats
    - [ ] Data should still be there

## Step 7: Troubleshooting

### Problem: GraphQL compilation errors

**Solution:**
```bash
# Clear Relay cache
rm -rf src/**/__generated__

# Regenerate
npm run relay-compiler
```

### Problem: "tokenData is not a field on Query"

**Solution:**
- Make sure migration ran (check PRAGMA user_version)
- Make sure server restarted after adding GraphQL module
- Run `npm run write-schema` again

### Problem: Token stats panel doesn't open

**Solution:**
- Check browser console for errors
- Verify tokenId is being passed correctly
- Check that GraphQL query in panel has generated types

### Problem: HP bar not showing

**Solution:**
- Token must have maxHp set in token_data table
- Check that query is fetching data (browser DevTools Network tab)
- Verify HP bar component is rendering in correct position

### Problem: Initiative tracker shows error

**Solution:**
- Verify mapId is correct
- Check that combatState query works in GraphiQL
- Look for GraphQL errors in browser console

### Problem: Database locked error

**Solution:**
```bash
# Stop all Node processes
# Delete database and restart
rm data/db.sqlite
npm run start:server:dev
```

## Success Criteria

Phase 1 is complete when:

- ✅ Token stats panel opens and displays
- ✅ HP can be set and persists
- ✅ Damage/healing affects HP correctly
- ✅ Temp HP absorbs damage first
- ✅ Conditions can be toggled
- ✅ Initiative tracker opens
- ✅ Tokens can be added to initiative
- ✅ Combat can start/advance/end
- ✅ Round number increments correctly
- ✅ Active token is highlighted
- ✅ Data persists across refreshes

## Next Steps

After Phase 1 is working:
- **Phase 2:** Enhanced Note System (templates, auto-linking)
- **Phase 3:** Automation & Macros
- **Phase 4:** AI Assistant (optional)

See `ENHANCEMENT_ROADMAP.md` for details on subsequent phases.

---

**Need Help?**
- Check `PHASE1_PROGRESS.md` for detailed status
- Review GraphQL queries in `server/graphql/modules/token-data.ts`
- Check database schema in `server/migrations/4.ts`
- Look at component code in `src/dm-area/token-stats-panel.tsx`
