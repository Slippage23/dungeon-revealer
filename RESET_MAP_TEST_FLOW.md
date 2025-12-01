# Reset Map Feature - Test Flow

## What Should Happen

1. **User clicks "Reset Map" button** in DM toolbar
2. **Confirmation dialog appears** with warning message
3. **User confirms** action
4. **Fog-of-war clears** (canvas context updated)
5. **GraphQL mutation sent via Socket.IO**
   - Query: `mutation mapTokenRemoveMany($input: MapTokenRemoveManyInput!)`
   - Variables: `{ input: { mapId: "...", tokenIds: [...] } }`
6. **Backend receives mutation**
   - Logs: `[GraphQL] mapTokenRemoveMany resolver called with: { mapId: '...', tokenIds: [...] }`
   - Logs: `[Map-Lib] removeManyMapToken called with: { mapId: '...', tokenIds: [...] }`
   - Logs: `[Map-Lib] Auth check passed`
   - Logs: `[Map-Lib] Calling removeTokensById`
   - Logs: `[Map-Lib] Invalidating resources`
   - Logs: `[Map-Lib] removeManyMapToken complete`
7. **Tokens deleted from database**
8. **Live query invalidated** → UI updates automatically
9. **All tokens disappear from map**
10. **Initiative tracker updates** (if visible)

## Known Issues Fixed

- ✅ Frontend was using HTTP fetch instead of Socket.IO
- ✅ GraphQL query format corrected to use variables properly
- ✅ Backend logging added to trace execution

## Test Steps

1. Open browser: http://localhost:4000/dm
2. Verify 3 tokens visible on map
3. Verify initiative tracker shows tokens
4. Click "Reset Map" button (RotateCCW icon)
5. Click "Confirm" in dialog
6. Observe:
   - Fog clears ✓
   - Tokens disappear ✓
7. Check terminal logs for mutation execution traces

## Expected Console Logs

### Frontend (Browser Console)

```
[RemoveAllTokens] Sending mutation via Socket.IO with variables: {input: {mapId: "21dc4ebc-923a-4aa0-9f98-b2e184140a2d", tokenIds: [...]}}
[RemoveAllTokens] Socket.IO result: {data: {mapTokenRemoveMany: true}}
[RemoveAllTokens] Success! All tokens removed
```

### Backend (Terminal)

```
[GraphQL] mapTokenRemoveMany resolver called with: {mapId: '21dc4ebc-923a-4aa0-9f98-b2e184140a2d', tokenIds: [...]}
[Map-Lib] removeManyMapToken called with: {mapId: '21dc4ebc-923a-4aa0-9f98-b2e184140a2d', tokenIds: [...]}
[Map-Lib] Auth check passed
[Map-Lib] Calling removeTokensById
[Map-Lib] Invalidating resources
[Map-Lib] removeManyMapToken complete
```

## If It Doesn't Work

1. **Socket.IO message not received** → Check browser DevTools Network tab for WebSocket frames
2. **Backend mutation not called** → Check backend terminal for GraphQL logs
3. **Tokens not deleted** → Check database file `data/db.sqlite` to verify
4. **UI not updating** → Check if live query invalidation is working
