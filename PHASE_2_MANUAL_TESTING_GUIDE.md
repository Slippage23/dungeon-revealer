# 🧪 PHASE 2 MANUAL TESTING GUIDE

## Server Status ✅

**Backend**: Running on http://localhost:3000  
**Frontend**: Running on http://localhost:4000  
**DM Area**: http://localhost:4000/dm

Both servers are now running in background terminals. You can switch between them as needed.

---

## 📋 Test Scenarios

### Test Scenario 1: Templates - Create & List

**Objective**: Verify template creation, storage, and listing

**Steps**:

1. **Navigate to DM Area**

   - URL: http://localhost:4000/dm
   - You should see the map editor interface

2. **Look for the Note Editor Sidebar**

   - Look for a sidebar on the right side of the screen
   - You should see a "Templates" tab
   - (If not visible, it may need to be wired into the UI - check browser console for errors)

3. **Create a Template**

   - Click "Manage Templates" or similar button
   - Click "New Template"
   - Fill in:
     - **Name**: "Character Template"
     - **Category**: "Characters"
     - **Description**: "Standard character sheet format"
   - Add fields:
     - Click "Add Field"
     - Field Type: "text"
     - Field Label: "Character Name"
     - Field Placeholder: "Enter character name"
   - Click "Create Template"

4. **Verify Template Appears**

   - Switch to "Templates" tab
   - You should see "Character Template" in the list
   - Try creating another template to verify list updates

5. **Test Deletion**
   - Click delete button (trash icon) on a template
   - Template should disappear from list
   - Verify the list updates

**Expected Results** ✅

- [ ] Template modal opens
- [ ] Can add multiple fields with different types
- [ ] Template appears in list after creation
- [ ] Multiple templates can be created
- [ ] Templates can be deleted
- [ ] List updates in real-time

**If It Fails**:

- Check browser console (F12) for errors
- Check "Backend Terminal Output" below
- See troubleshooting section

---

### Test Scenario 2: Categories - Create Hierarchy

**Objective**: Verify category creation and nested hierarchy

**Steps**:

1. **Navigate to Categories Tab**

   - Look for "Categories" tab in sidebar
   - Should show empty tree initially

2. **Create Root Categories**

   - Click "New Category"
   - Name: "NPCs"
   - Parent: (leave empty for root)
   - Click "Create"

3. **Create Nested Categories**

   - Click "New Category" again
   - Name: "Tavern Keepers"
   - Parent: "NPCs"
   - Click "Create"
   - Repeat for:
     - "Merchants" (parent: NPCs)
     - "Guards" (parent: NPCs)

4. **Expand Tree**

   - Click expand arrow next to "NPCs"
   - Should show:
     - Tavern Keepers
     - Merchants
     - Guards

5. **Test Inline Editing**

   - Hover over a category name
   - Click edit icon (if available)
   - Change name to "Tavern Owners"
   - Verify change persists

6. **Create Deep Nesting**
   - Create subcategory under "Tavern Keepers":
     - Name: "Friendly Keepers"
     - Parent: "Tavern Keepers"
   - Expand tree to show 3 levels deep

**Expected Results** ✅

- [ ] Can create root categories
- [ ] Can create nested categories
- [ ] Tree expands/collapses properly
- [ ] 3+ levels of nesting work
- [ ] Inline editing updates names
- [ ] Tree updates in real-time

**If It Fails**:

- Check browser console for errors
- Verify category tree is rendering
- Check GraphQL mutations are being called

---

### Test Scenario 3: Backlinks - Create & View

**Objective**: Verify bidirectional link tracking and display

**Steps**:

1. **Create Two Notes** (prerequisite)

   - Create Note 1: "City Map"
   - Create Note 2: "Population Centers"

2. **Create a Link**

   - In Note 1, add text or create link to Note 2
   - (This depends on existing note linking UI)
   - Link should be tracked in database

3. **View Backlinks Tab**

   - Switch to "Links" tab in sidebar
   - Select Note 1 "City Map"
   - Should show:
     - "Outgoing links" (links FROM this note)
     - "Incoming links" (links TO this note)

4. **Create Reverse Link**

   - Create link from Note 2 → Note 1
   - Go back to "Links" tab for Note 1
   - Should now show incoming link from Note 2

5. **Test Link Navigation**
   - Click on an incoming link
   - Should navigate to that note
   - Verify link is bidirectional

**Expected Results** ✅

- [ ] Links are created and stored
- [ ] Backlinks tab shows incoming/outgoing links
- [ ] Links display with visual distinction
- [ ] Can navigate via links
- [ ] Bidirectional tracking works
- [ ] Link count is accurate

**If It Fails**:

- Check if note linking feature is already implemented
- Verify backlinks panel is rendering
- Check GraphQL queries for links

---

### Test Scenario 4: Integration - Master Sidebar

**Objective**: Verify all three features work together in sidebar

**Steps**:

1. **Sidebar Visibility**

   - Check right side of screen
   - Should see sidebar with tabs:
     - [ ] Templates
     - [ ] Categories
     - [ ] Links (only if note selected)

2. **Tab Switching**

   - Click between tabs
   - Content should change
   - Each tab should show relevant feature

3. **Select a Note**

   - Select a note in the main editor
   - "Links" tab should now appear
   - Links tab should update with note's links

4. **Apply Template**

   - Select a note
   - Switch to Templates tab
   - Click a template
   - Note should pre-populate with template fields
   - Verify fields appear in note

5. **Categorize Note**
   - Select a note
   - Switch to Categories tab
   - Select a category
   - Note should be marked as belonging to category
   - Verify association in database

**Expected Results** ✅

- [ ] Sidebar renders with all 3 tabs
- [ ] Tabs switch content correctly
- [ ] Links tab appears only when note selected
- [ ] Template application works
- [ ] Category selection works
- [ ] All features integrated in one sidebar

**If It Fails**:

- Component may not be wired into main editor
- Check console for import/rendering errors
- Verify component is exported correctly

---

## 🔍 What to Look For

### Console Errors

- Open browser DevTools: **F12**
- Check Console tab for errors
- Note any error messages

### Network Requests

- Open DevTools → Network tab
- Look for GraphQL operations:
  - `useNoteTemplatesQuery`
  - `useNoteCategoriesQuery`
  - `useNoteBacklinksToQuery`
  - `useNoteBacklinksFromQuery`
- Mutations should appear when creating/updating

### Performance

- All queries should complete < 100ms
- Mutations should complete < 500ms
- UI should feel responsive

---

## 🎯 Success Criteria

### Minimum (MVP)

- [ ] At least one template can be created
- [ ] At least one category can be created with nesting
- [ ] Sidebar shows tabs without errors

### Standard

- [ ] All 3 features create/read data
- [ ] Templates list shows created templates
- [ ] Categories show hierarchical tree
- [ ] Backlinks display incoming/outgoing links
- [ ] No console errors

### Excellent

- [ ] All features work seamlessly
- [ ] Real-time updates visible
- [ ] Smooth transitions between tabs
- [ ] All data persists after refresh
- [ ] Performance is good (< 100ms queries)

---

## 📝 Testing Checklist

### Phase 2 Feature Tests

**Templates**

- [ ] Create template with name
- [ ] Add fields to template
- [ ] View template in list
- [ ] Delete template
- [ ] Multiple templates coexist

**Categories**

- [ ] Create root category
- [ ] Create nested category
- [ ] Tree renders hierarchically
- [ ] Expand/collapse works
- [ ] Edit category name (if available)
- [ ] Create 3+ levels of nesting

**Backlinks**

- [ ] Create link between notes
- [ ] View incoming links
- [ ] View outgoing links
- [ ] Navigate via link
- [ ] Bidirectional tracking works

**Integration**

- [ ] Sidebar renders all tabs
- [ ] Tabs switch correctly
- [ ] Content loads without errors
- [ ] Features integrate smoothly

### Data Persistence

- [ ] Refresh page (Ctrl+R)
- [ ] Templates still appear
- [ ] Categories still appear
- [ ] Links still appear
- [ ] Order is maintained

### Performance

- [ ] No lag when creating items
- [ ] Queries complete quickly
- [ ] UI feels responsive
- [ ] No memory leaks (check DevTools)

---

## 🐛 Troubleshooting

### "Sidebar not visible"

**Solution 1**: Check if component is wired into editor

```bash
# Check import in note editor
grep -r "EnhancedNoteEditorSidebar" src/dm-area/
```

**Solution 2**: Check browser console (F12)

- Look for "Component not imported" or similar errors
- Check if component renders without errors

**Solution 3**: Manually verify component exists

```bash
ls src/dm-area/note-editor/enhanced-note-editor-sidebar.tsx
```

### "Queries fail with GraphQL errors"

**Check Schema**:

```bash
npm run write-schema
npm run build:frontend
```

**Check Backend**:

- Look at backend terminal output
- Check for GraphQL resolution errors

### "Templates not appearing in list"

**Check Backend**:

- Open another terminal
- Query database: `sqlite3 data/db.sqlite "SELECT * FROM note_templates;"`
- Should show created templates

**Check Frontend**:

- Open DevTools → Application → Local Storage
- Look for Relay cache entries
- Check if query is cached properly

### "Categories tree not rendering"

**Check**:

- Verify categories exist: `sqlite3 data/db.sqlite "SELECT * FROM note_categories;"`
- Check DevTools console for errors
- Verify tree component is rendering

### Servers crash or don't start

**Backend Issues**:

- Check terminal: `a14b190c-9ce1-4c5a-8ceb-27130a7a83ba`
- Look for error messages
- Verify port 3000 is available

**Frontend Issues**:

- Check terminal: `12c5c3f0-1d57-4ef1-a24c-763b99ed4598`
- Look for build errors
- Verify port 4000 is available

---

## 📊 Testing Log Template

```
TEST SESSION: [Date/Time]
Tester: [Your Name]
Environment: Local Dev (localhost:4000/dm)

### Test 1: Templates
Status: [ ] Pass [ ] Fail [ ] Partial
Notes: _______________________________________________

### Test 2: Categories
Status: [ ] Pass [ ] Fail [ ] Partial
Notes: _______________________________________________

### Test 3: Backlinks
Status: [ ] Pass [ ] Fail [ ] Partial
Notes: _______________________________________________

### Test 4: Integration
Status: [ ] Pass [ ] Fail [ ] Partial
Notes: _______________________________________________

Overall: [ ] All Pass [ ] Some Issues [ ] Major Problems
Issues Found:
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________
```

---

## 🔗 Backend Terminal Output

**Terminal ID**: `a14b190c-9ce1-4c5a-8ceb-27130a7a83ba`

**If Backend Has Issues**:

```bash
# In a new terminal, check server logs:
cd c:\Temp\git\dungeon-revealer
npm run start:server:dev
```

**Expected Output**:

```
Starting dungeon-revealer@3f6996c
Configuration:
- HOST: 0.0.0.0
- PORT: 3000

dungeon-revealer is reachable via http://127.0.0.1:3000
Player Section: http://127.0.0.1:3000
DM Section: http://127.0.0.1:3000/dm
```

---

## 🔗 Frontend Terminal Output

**Terminal ID**: `12c5c3f0-1d57-4ef1-a24c-763b99ed4598`

**If Frontend Has Issues**:

```bash
# In a new terminal, check frontend logs:
cd c:\Temp\git\dungeon-revealer
npm run start:frontend:dev
```

**Expected Output**:

```
vite v2.7.3 dev server running at:
> Network:  http://192.168.0.150:4000/
> Local:    http://localhost:4000/
ready in 497ms.
```

---

## ✅ When Done Testing

1. **Document Results**

   - Note which features work
   - Note any issues found
   - Save testing log

2. **Report Findings**

   - Summarize results
   - List any bugs discovered
   - Suggest fixes if applicable

3. **Next Steps**
   - If all pass: Ready for production
   - If issues: Fix and re-test
   - If partial: Prioritize fixes

---

## 🎯 Expected Behavior Summary

| Feature     | Expected Behavior                        | Status |
| ----------- | ---------------------------------------- | ------ |
| Templates   | Create, list, delete                     | ?      |
| Categories  | Create nested hierarchy, expand/collapse | ?      |
| Backlinks   | Track incoming/outgoing links            | ?      |
| Integration | All 3 features in sidebar, tab switching | ?      |
| Performance | < 100ms queries, responsive UI           | ?      |
| Persistence | Data survives page refresh               | ?      |

---

**Start Testing Now!** 🚀

Browser is open at: http://localhost:4000/dm

Begin with **Test Scenario 1: Templates** and work through each scenario.

Update this checklist as you go! ✅
