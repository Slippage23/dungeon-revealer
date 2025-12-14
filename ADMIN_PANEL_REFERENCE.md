# Admin Panel: Quick Reference & Architecture Guide

**Last Updated**: December 14, 2025 (Session 13)  
**Status**: ✅ Fully Operational

---

## Quick Start

### Accessing the Admin Panel

1. Navigate to `http://localhost:4000/admin` (or your deployment URL + `/admin`)
2. Enter admin password (must match `DM_PASSWORD` environment variable)
3. Dashboard loads with statistics and navigation tabs

### Prerequisites

- Backend running on port 3000
- Frontend running on port 4000 (dev) or built bundle for production
- `DM_PASSWORD` environment variable set
- SQLite database populated with data

---

## Architecture Overview

### Component Hierarchy

```
AdminArea (HTTP auth wrapper)
  ↓
AdminRenderer (Socket creation)
  ↓
AdminContent (Socket auth + Relay setup)
  ↓
RelayEnvironmentProvider (Relay context)
  ↓
FetchContext.Provider (HTTP fetch helper)
  ↓
AdminLayout (UI structure)
  ├─ Dashboard Tab
  ├─ Maps Tab
  ├─ Tokens Tab
  └─ Notes Tab
```

### Authentication Flow

```
1. User enters password
2. HTTP POST /auth validates against DM_PASSWORD
3. Password stored in component state
4. AdminRenderer creates Socket.IO connection
5. AdminContent emits "authenticate" event with password
6. Backend validates and creates admin session
7. Backend emits "authenticated" event
8. Admin dashboard renders with GraphQL queries enabled
```

### GraphQL Query Pattern

```
Dashboard:
  - maps(first: 50) → Count of all maps
  - tokenImages(first: 50) → Count of all tokens
  - notes(first: 50) → Count of all notes

Maps Tab:
  - maps(first: 12, after: cursor, titleNeedle: search)

Tokens Tab:
  - tokenImages(first: 12, after: cursor, titleFilter: search)

Notes Tab:
  - notes(first: 50, after: cursor, filter: All)
```

---

## Key Implementation Details

### Socket.IO Authentication (src/admin-area/admin-area.tsx)

**The Critical Part**:

```typescript
const authenticate = () => {
  socket.emit("authenticate", {
    password: adminPassword,
    desiredRole: "admin",
  });
};

socket.on("connect", () => {
  setConnectionMode("connected");
  authenticate();
});

socket.on("authenticated", () => {
  setConnectionMode("authenticated");
  // Only NOW do we render AdminLayout with GraphQL queries
});
```

**Why This Matters**:

- Socket must authenticate BEFORE GraphQL queries run
- Backend rejects unauthenticated GraphQL requests
- Without this, queries hang indefinitely

### React Hooks Rules Compliance

**WRONG** (causes error #310):

```typescript
if (connectionMode !== "authenticated") {
  return <SplashScreen />;
}
const localFetch = useCallback(...);  // ❌ Called after return!
```

**CORRECT**:

```typescript
const localFetch = useCallback(...);  // ✅ Called first
React.useEffect(() => { ... });
if (connectionMode !== "authenticated") {
  return <SplashScreen />;
}
```

### Relay Environment Setup

```typescript
const relayEnvironment = useStaticRef(() => createEnvironment(socket));
// ✅ Use useStaticRef to create once and reuse
// ✅ Must be created before RelayEnvironmentProvider
// ✅ Socket must be authenticated before queries use it
```

### GraphQL Query Limits

Backend enforces:

- Maximum `first` parameter: **50 items**
- Minimum `first` parameter: **1 item**
- Default limit: **50 items**

**File**: `server/graphql/modules/relay-spec/index.ts`

**Current Admin Tab Usage**:

- Dashboard: `first: 50` ✅
- Notes: `first: 50` ✅
- Maps: `first: 12` ✅
- Tokens: `first: 12` ✅

---

## File Structure

```
src/admin-area/
├── admin-area.tsx                 # Main component + auth
├── admin-layout.tsx               # UI structure + tabs
├── admin-navigation.tsx           # Sidebar navigation
├── __generated__/                 # Relay generated files
│   ├── adminArea_AdminQuery.graphql
│   └── (other generated files)
└── tabs/
    ├── dashboard-tab.tsx          # Statistics display
    ├── maps-tab.tsx               # Maps management
    ├── notes-tab.tsx              # Notes management
    └── tokens-tab.tsx             # Tokens management
```

---

## Common Issues & Solutions

### Issue: "Invalid first argument"

**Cause**: Query requesting more than 50 items  
**Solution**:

```typescript
// ❌ Wrong
first: 100;

// ✅ Correct
first: 50;
```

### Issue: "Cannot read properties of null (reading 'environment')"

**Cause**: Child component using `useRelayEnvironment()` without provider  
**Solution**:

```typescript
<RelayEnvironmentProvider environment={relayEnvironment}>
  <AdminLayout /> {/* Now can use Relay hooks */}
</RelayEnvironmentProvider>
```

### Issue: Infinite spinner on admin page

**Cause**: Socket not authenticated before queries  
**Solution**: Ensure socket emits "authenticate" and waits for "authenticated" event

### Issue: React Hook Error #310

**Cause**: Hooks called after conditional return  
**Solution**: Move all hooks to top, before any conditional logic

---

## Testing Checklist

- [ ] Admin page loads at `/admin`
- [ ] Password validation works
- [ ] Splash screen shows "connecting" → "authenticated" flow
- [ ] Dashboard displays statistics without errors
- [ ] Maps tab loads and displays maps
- [ ] Tokens tab loads and displays tokens
- [ ] Notes tab loads and displays notes
- [ ] Search functionality works in tabs
- [ ] Pagination works (if implemented)
- [ ] No console errors
- [ ] No network errors
- [ ] Socket shows authenticated in DevTools

---

## Backend Integration Points

### Routes (server/server.ts)

```typescript
app.get("/admin", (_, res) => {
  res.send(indexHtmlContent);
});
```

### Socket Events (server/server.ts)

```typescript
socket.on("authenticate", (data) => {
  // Validate password
  // Create session with role: "admin"
  // Emit "authenticated" back to client
});
```

### GraphQL Modules (server/graphql/modules/)

```typescript
// All modules support pagination with first/after parameters
maps(first: Int, after: String, titleNeedle: String)
tokenImages(first: Int, after: String, titleFilter: String)
notes(first: Int, after: String, filter: NotesFilter)
```

---

## Development Workflow

### Adding a New Admin Tab

1. **Create tab component** in `src/admin-area/tabs/new-tab.tsx`

   ```typescript
   const query = graphql`
     query newTab_DataQuery($first: Int, $after: String) {
       data(first: $first, after: $after) {
         edges {
           node {
             id
             title
           }
         }
         pageInfo {
           hasNextPage
           endCursor
         }
       }
     }
   `;

   export const NewTab: React.FC = () => {
     const { data, isLoading } = useQuery(query, { first: 50 });
     // Render UI
   };
   ```

2. **Update AdminLayout** to add tab button and route

3. **Update admin-navigation.tsx** if needed

4. **Rebuild**: `npm run build:frontend`

### Modifying a Query

1. Edit GraphQL query in tab component
2. Run `npm run relay-compiler` to update types
3. Update query parameters if needed (keep `first ≤ 50`)
4. Rebuild: `npm run build:frontend`

---

## Performance Considerations

- **Initial Load**: ~2-3 seconds (socket auth + Relay queries)
- **Tab Switch**: ~500ms (lazy loading)
- **Search**: ~100ms (filter on client-side)
- **Bundle Size**: `admin-area.js` ~31 KiB (gzipped 6.4 KiB)

### Optimization Opportunities

1. Implement infinite scroll for pagination
2. Cache queries using Relay store persistence
3. Lazy load tab components
4. Add search debouncing
5. Implement optimistic updates for mutations

---

## Debugging

### DevTools Network Tab

Watch for:

- Socket.IO handshake and authentication
- GraphQL queries (usually POST to `/api`)
- Bundle loading (`admin-area.*.js`)

### DevTools Console

Check for:

- No "Invalid first argument" errors
- No "Cannot read properties" errors
- No Hook errors
- Socket authentication events logged

### Backend Logs

Look for:

```
[Socket.IO] Authenticate event received ✅
[Socket.IO] Authenticated DM ✅
[Socket.IO] Socket registered with GraphQL ✅
[GraphQL Query] maps requested ✅
```

---

## Security Notes

1. **Password**: Compared against `DM_PASSWORD` env variable
2. **Role**: Admin panel requires "admin" role (DM login)
3. **Session**: Created per socket connection
4. **GraphQL**: Queries validated against user role

### Never

- ❌ Expose admin password in code
- ❌ Send password in URLs
- ❌ Store password in localStorage (current code doesn't)
- ❌ Allow public access to `/admin`

### Always

- ✅ Use HTTPS in production
- ✅ Use strong DM_PASSWORD
- ✅ Validate user role server-side
- ✅ Validate GraphQL queries server-side

---

## Related Documentation

- **Main Copilot Instructions**: `.github/copilot-instructions.md`
- **Session 13 Details**: `SESSION_13_ADMIN_PANEL_FIX.md`
- **Architecture Overview**: `README.md`
- **GraphQL Schema**: `type-definitions.graphql`

---

## Support & Questions

For issues or questions about the admin panel:

1. Check "Common Issues & Solutions" section above
2. Review `SESSION_13_ADMIN_PANEL_FIX.md` for detailed fixes
3. Check backend logs for socket/GraphQL errors
4. Verify `DM_PASSWORD` environment variable is set

---

**Last Verified**: December 14, 2025  
**Build**: Vite production build  
**Node**: v14+  
**Browser**: Modern browsers with WebSocket support
