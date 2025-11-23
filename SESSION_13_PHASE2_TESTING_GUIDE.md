# Session 13: Phase 2 Feature Testing Guide

## Quick Health Check (2 minutes)

### 1. Open Browser DevTools

- Press **F12** to open Developer Tools
- Go to **Console** tab
- Clear any existing messages (Ctrl+L or ⌘+K)

### 2. Navigate to DM Area

- Open http://localhost:4000/dm
- Enter DM password when prompted
- Wait for map to load (should see grid, tokens, etc.)

### 3. Check Initial Console Output

- Look for server connection messages
- Should see "Connected to socket" or similar
- No errors should appear

---

## Full Phase 2 Testing (5 minutes)

### Step 1: Create a Test Note

1. Look for a button to create/open notes in the DM area
2. Click "Open or create a new note" or similar button
3. You should see a new window titled "Note Editor" appear on the map
4. This window might say "Loading..." briefly, then show note content
5. **Expected Result**: A note window is visible ✓

### Step 2: Toggle Library Sidebar OFF

1. Look for the **Library icon** (usually looks like a book 📖)
2. This should be in the note window's header or nearby
3. Click it to **hide** the library sidebar
4. The note window should expand to show more space
5. **Expected Result**: Sidebar space opens up ✓

### Step 3: Check for Phase 2 Tabs

After toggling library off, you should see three tabs appear:

| Tab Name       | Should Show                                           |
| -------------- | ----------------------------------------------------- |
| **Templates**  | List of note templates (Monster, NPC, Location, etc.) |
| **Categories** | List of note categories with color coding             |
| **Links**      | List of backlinks and forward links                   |

**Expected Result**: All three tabs visible ✓

### Step 4: Check Browser Console for Debug Logs

While the tabs are visible, check the Console tab (F12) for these logs:

```javascript
// Should see these:
[SIDEBAR DEBUG] Component rendering!
[EnhancedNoteEditorSidebar] Got mapId: {
  propMapId: undefined,
  contextMapId: "map-id-here",
  mapId: "map-id-here",
  currentNoteId: "note-id-here"
}
[NoteTemplatesPanel] Rendering with mapId: map-id-here
[NoteTemplateList] Query state: {
  isLoading: false,
  error: null,
  data: [/* templates array */],
  mapId: "map-id-here"
}
```

**Expected Result**: All debug logs present and mapId values populated ✓

### Step 5: Test Templates Tab

1. Click the **Templates** tab
2. Should see a list of default templates
3. **Expected Templates**:
   - Monster
   - NPC
   - Location
   - Quest
   - Item
   - Trap
   - Encounter

**Expected Result**: Templates list loads ✓

### Step 6: Test Categories Tab

1. Click the **Categories** tab
2. Should see categories list (might be empty initially)
3. Try clicking "Create Category" button if available
4. **Expected Result**: Category UI loads ✓

### Step 7: Test Links Tab

1. Click the **Links** tab
2. Should show section for backlinks (links TO this note)
3. Should show section for forward links (links FROM this note)
4. Might be empty if no links created yet
5. **Expected Result**: Links UI loads ✓

---

## Troubleshooting

### Problem: "No tabs visible after toggling library"

**Possible Causes**:

1. Note window didn't open properly
2. Library sidebar toggle not working
3. React component not rendering

**Solutions**:

1. Check Console (F12) for error messages
2. Try creating a fresh note
3. Verify the library icon click is working

### Problem: "Templates tab empty"

**Possible Causes**:

1. Backend query failed
2. GraphQL error loading templates
3. No templates in database

**Solutions**:

1. Check Network tab (F12 → Network) for GraphQL errors
2. Check backend terminal for error messages
3. Database might be empty (run migrations)

### Problem: "Debug logs not appearing"

**Possible Causes**:

1. Component not rendering (no note window)
2. Console cleared before logs appeared
3. LogLevel filter hiding logs

**Solutions**:

1. Make sure note window is open and visible
2. Keep console open while testing
3. Check Console filter dropdown for "Verbose" or "All Levels"

### Problem: "MapId showing as undefined"

**Possible Causes**:

1. MapIdContext not properly passed
2. Map not loaded yet
3. Context provider hierarchy broken

**Solutions**:

1. Wait a moment for map to fully load
2. Check that DmAreaRenderer is wrapping MapIdProvider
3. Verify `/src/dm-area/dm-area.tsx` lines 510-548

---

## Success Indicators ✅

When everything is working correctly, you should see:

- ✅ Phase 2 tabs visible (Templates, Categories, Links)
- ✅ Debug logs in console showing mapId and currentNoteId
- ✅ Templates loaded from backend (7 defaults visible)
- ✅ No console errors or warnings
- ✅ Tab content updates when switching tabs
- ✅ Categories and links sections load

---

## Files to Check if Issues Occur

| File                                                        | Purpose                                 |
| ----------------------------------------------------------- | --------------------------------------- |
| `/src/dm-area/dm-area.tsx`                                  | MapIdProvider hierarchy (lines 510-548) |
| `/src/dm-area/note-editor/enhanced-note-editor-sidebar.tsx` | Main sidebar component                  |
| `/src/dm-area/note-editor/note-templates-panel.tsx`         | Templates tab                           |
| `/src/dm-area/token-info-aside/token-info-aside.tsx`        | Note window container logic             |
| `/src/draggable-window.tsx`                                 | Window styling and sidebar prop         |

---

## Backend Health Check

If templates aren't loading, check backend logs:

Open the backend terminal (where `npm run start:server:dev` is running) and look for:

```
GraphQL Query: Query.noteTemplates
Executing resolver for: noteTemplates
```

If you see errors like:

```
Error: Cannot find db context
Error: Query execution failed
```

The backend context isn't set up correctly. Check:

1. Socket.io connection established
2. Database migration 8 applied
3. GraphQL schema registered

---

## Quick Commands

### Restart Backend

```powershell
# Kill existing process and restart
npm run start:server:dev
```

### Restart Frontend

```powershell
# Kill existing process and restart
npm run start:frontend:dev
```

### Re-run Relay Compiler

```powershell
# If generated files seem stale
npm run relay-compiler
```

### Clear Browser Cache

```
Ctrl + Shift + Delete (Windows)
or use: http://localhost:4000/dm in private/incognito window
```

---

## Success Criteria Summary

**Phase 2 is working when**:

1. ✅ Three tabs visible in note sidebar
2. ✅ Debug logs show in browser console
3. ✅ mapId is defined (not undefined)
4. ✅ Templates list loads with 7 items
5. ✅ No GraphQL errors in Network tab
6. ✅ No console errors or warnings

---

**Test Date**: November 14, 2025 (Session 13)  
**Status**: Ready for testing
