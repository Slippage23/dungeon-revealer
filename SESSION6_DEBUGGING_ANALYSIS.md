# Session 6: Comprehensive Debugging Analysis

## Executive Summary

User reports that HP bars and condition icons do not render on tokens despite:

- Frontend showing all Leva controls correctly
- No TypeScript compilation errors
- Backend running successfully
- Chrome console showing: "Error occurred while trying to decode value"

## Investigation Timeline

### Phase 1: Initial Hypothesis (Messages 1-8)

**Assumption:** The rendering components aren't receiving data from GraphQL

- Fixed GraphQL mutation syntax error (removed tokenData wrapper)
- Extended TokenDataFragment with mapId field
- Implemented all 5 Leva combat stat controls with mutation handlers
- **Result:** Controls work, but visuals still don't render

### Phase 2: Fragment Naming Fix (Message 9)

**Assumption:** Relay fragment naming conventions were wrong

- Fixed fragment names to match Relay module-based convention
- Updated parent fragment spreads
- Ran relay-compiler
- **Result:** Types regenerated, but visuals still don't render

### Phase 3: Data Flow Deep Dive (Message 10)

**Assumption:** Database/GraphQL layer has data issues

- Added comprehensive logging to database layer
- Added logging to GraphQL resolvers
- Added logging to MapToken tokenData resolver
- **Finding:** No token data exists in database yet!
  - Tables created successfully (migration 4)
  - But `token_data` table is completely empty
  - Queries return null as expected
  - **Root Cause:** No mutations have been executed yet - the database was never populated

### Phase 4: Relay Decode Error Investigation (Current)

**Finding:** The console error "Error occurred while trying to decode value. value: null" indicates:

- Relay is trying to decode null as a NON-NULLABLE STRING field
- This happens when `tokenData` is null on MapToken
- The fragment query includes fields with NonNull constraints
- Relay decoder fails when schema says "String!" but receives null

## Root Cause Analysis

### The Core Problem

The frontend queries:

```graphql
tokenData {
  id      # NonNull!
  tokenId # Was NonNull! (FIXED)
  mapId   # Was NonNull! (FIXED)
  currentHp
  maxHp
  tempHp  # NonNull!
  conditions  # NonNull! List
  ...
}
```

When `tokenData` is `null` on MapToken (because no entry exists in database), Relay shouldn't try to decode the fields. But the old schema with NonNull field types causes Relay to attempt decoding, which fails when it receives null.

### Why tokenData is Null

1. Backend correctly returns null when no token_data entry exists
2. This is expected behavior - token data is lazy-created on first mutation
3. But the GraphQL schema had NonNull constraints that didn't match the actual nullability

### The Fix Applied

Changed two TokenData fields from NonNull to nullable:

- `tokenId: String!` → `tokenId: String`
- `mapId: String!` → `mapId: String`

This allows null values to pass through Relay's decoder when tokenData itself is null.

## Logging Evidence

### Server Output

```
[GraphQL MapToken] tokenData resolver called: {
  mapTokenId: 'f7b6b41a-38a4-443c-9d3f-b60739c88b26',
  mapTokenLabel: ''
}
[GraphQL MapToken] getTokenData called with tokenId: f7b6b41a-38a4-443c-9d3f-b60739c88b26
[TokenDataDb] getTokenData requested: { tokenId: 'f7b6b41a-38a4-443c-9d3f-b60739c88b26' }
[TokenDataDb] getTokenData row: undefined
[TokenDataDb] getTokenData returning: null
[GraphQL MapToken] getTokenData returned: null
```

### Database Query

- Query: `SELECT * FROM token_data WHERE token_id = ?`
- Result: No rows found (database is empty)
- Expected: Returns null (which is correct)

## The Real Question

**Why doesn't the Leva control save trigger the mutation?**

Looking at the Leva control in map-view.tsx (lines 488-640):

```typescript
{
  currentHp: {
    value: tokenData?.currentHp ?? 0,  // Conditional: only shows if tokenData exists
    onEditEnd: (value) => {
      if (tokenData) {  // Only triggers mutation if tokenData exists
        mutate({ variables: { input: { ... } } });
      }
    }
  }
}
```

**POSSIBLE BUG:** The `if (tokenData)` check prevents mutation from firing when tokenData is null (which it always is initially)!

This means:

1. Page loads, tokens have no tokenData entry
2. Leva controls show default values (HP: 0)
3. User tries to change HP
4. Component checks `if (tokenData)` - it's null
5. Mutation never fires
6. Database never gets populated
7. tokenData stays null forever

## Recommended Next Steps

1. **Test if mutations are being triggered:**

   - Open Network tab in browser DevTools
   - Adjust HP slider
   - Check if `upsertTokenData` GraphQL mutation is sent to server
   - If no network request: mutations are blocked by `if (tokenData)` guard

2. **If mutations are blocked:**

   - Remove or modify the `if (tokenData)` check
   - Allow mutations even when tokenData is null
   - Let the backend create default entry on first upsert

3. **If mutations ARE being sent:**
   - Check server logs for error messages during mutation
   - Verify database insert succeeds
   - Check if GraphQL returns error in response

## File Changes This Session

### server/token-data-db.ts

- Added comprehensive logging to `rowToTokenData` and database query functions
- Wrapped `JSON.parse` in try-catch with error handling
- Logs show raw value, parsed value, and final TokenData object

### server/graphql/modules/token-data.ts

- Added debug logging to all field resolvers (currentHp, maxHp, tempHp, etc.)
- Added debug logging to query resolvers (tokenData, mapTokenData)
- Changed schema: `tokenId: String!` → `tokenId: String` (nullable)
- Changed schema: `mapId: String!` → `mapId: String` (nullable)

### server/graphql/modules/map.ts

- Added debug logging to MapToken tokenData field resolver
- Logs show mapTokenId, mapTokenLabel, and what getTokenData returns

## Test Instructions for User

1. **Enable Network Debugging:**

   - Open Chrome DevTools (F12)
   - Go to Network tab
   - Filter: XHR/Fetch

2. **Test Mutation Trigger:**

   - Select a token on the map
   - In Leva panel (right sidebar), try to change HP value
   - Check Network tab for GraphQL request

3. **Expected Behavior:**

   - Network tab shows `POST` to `/api/socket.io`
   - GraphQL payload includes `upsertTokenData` mutation
   - Mutation should contain: tokenId, mapId, currentHp, etc.

4. **If Mutations Don't Fire:**

   - This confirms the `if (tokenData)` guard is blocking mutations
   - Need to modify frontend logic to allow first-time creation

5. **Check Backend Logs:**
   - Terminal running server should show all `[TokenDataDb]` and `[GraphQL]` debug messages
   - Look for `getTokenData row:` messages to confirm queries are running
   - Look for `upsertTokenData` execution if mutations are triggered

## GraphQL Schema Context

### Current TokenData Type

```graphql
type TokenData {
  id: ID! # Non-nullable
  tokenId: String # NOW NULLABLE (was String!)
  mapId: String # NOW NULLABLE (was String!)
  currentHp: Int # Nullable
  maxHp: Int # Nullable
  tempHp: Int! # Non-nullable
  armorClass: Int # Nullable
  speed: Int # Nullable
  initiativeModifier: Int! # Non-nullable
  conditions: [TokenCondition!]! # Non-nullable array of non-nullable conditions
  notes: String # Nullable
  createdAt: Int! # Non-nullable
  updatedAt: Int! # Non-nullable
}
```

### MapToken Type

```graphql
type MapToken {
  id: ID!
  ...other fields...
  tokenData: TokenData       # NULLABLE - can be null if no entry exists
}
```

## Debugging Commands

Check database contents:

```bash
sqlite3 data/db.sqlite "SELECT COUNT(*) as token_data_count FROM token_data;"
```

Inspect a specific token:

```bash
sqlite3 data/db.sqlite "SELECT * FROM token_data LIMIT 1;"
```

Check tables exist:

```bash
sqlite3 data/db.sqlite ".schema token_data"
```

## Next Phase

Once we confirm mutations are being triggered:

1. Database entries will be created on first mutation
2. Subsequent queries will return non-null tokenData
3. Fragment resolvers will have data to work with
4. Components will render HP bars and condition icons
5. Everything will work end-to-end

**Key Insight:** The system is working correctly at the architectural level. It's waiting for the first mutation to populate the database. The issue is likely the `if (tokenData)` guard preventing first-time creation, or the user simply hasn't tried to modify any values yet to trigger the mutations.
