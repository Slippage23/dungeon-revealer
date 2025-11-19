# Phase 2 Integration Testing - Live Session

## ✅ What to Test

### 1. **Open/Create a Note**

- In the DM area, click on a note or create a new one
- You should see a window open with the note editor

### 2. **Look for the Sidebar Toggle**

- You should see a button/option to toggle the sidebar (usually near the note window)
- Or click elsewhere to hide the library sidebar first

### 3. **Check for the Three Tabs**

When a note is selected (and library is hidden), the sidebar should show:

- ✅ **Templates** tab
- ✅ **Categories** tab
- ✅ **Links** tab (only appears when a note is selected)

### 4. **Test Templates Tab**

```
[ Templates Tab ]
├─ "Create New Template" button
├─ List of existing templates
└─ Click to apply a template to current note
```

### 5. **Test Categories Tab**

```
[ Categories Tab ]
├─ "Create New Category" button
├─ Tree view of categories (nested)
└─ Click to select/filter notes by category
```

### 6. **Test Backlinks Tab** (if note is selected)

```
[ Links Tab ]
├─ "Linked From" (incoming links)
├─ "Links To" (outgoing links)
└─ Click linked note to navigate to it
```

## 🎯 Expected Behavior

**Library Sidebar** (when enabled):

- Shows list of notes
- Has search/filter functionality
- Click note to open it

**Phase 2 Sidebar** (when note is open and library is hidden):

- Shows Templates, Categories, Backlinks
- Can create new templates
- Can create/manage categories
- Can navigate between linked notes

## 🔍 What to Look For in Browser Console

Should see NO errors like:

- ❌ "Cannot read property 'mapId' of undefined"
- ❌ "useCurrentMapId is not a hook"
- ❌ "EnhancedNoteEditorSidebar is undefined"

Should be clean or only show deprecation warnings (which are fine)

## 📝 Testing Steps

1. **Login** to the DM area with your password
2. **Open or create a note** - click "Create new note" or select existing
3. **Toggle the library sidebar** - close it so Phase 2 sidebar appears
4. **Verify all 3 tabs are visible** - Templates, Categories, Links
5. **Try each tab** - ensure no console errors
6. **Create a template** - click "Create New Template" in Templates tab
7. **Create a category** - click "Create New Category" in Categories tab
8. **Link notes** - if you have multiple notes, check if links appear in Links tab

## 🚀 Success Criteria

✅ Phase 2 sidebar appears when a note is selected
✅ All three tabs render without errors
✅ No console errors related to mapId or context
✅ Can interact with tabs (click buttons, etc.)
✅ Backend and frontend communicate (check Network tab)

## 🐛 If Something Goes Wrong

1. **Check browser console** (F12) for errors
2. **Check backend logs** for GraphQL errors
3. **Check network tab** for failed requests
4. **Refresh the page** (Ctrl+Shift+R for hard refresh)

---

**Integration Status**: ✅ COMPLETE  
**Frontend Server**: ✅ Running on port 4000  
**Backend Server**: ✅ Running on port 3000  
**MapIdProvider**: ✅ Wrapping content  
**EnhancedNoteEditorSidebar**: ✅ Wired into note window

Ready to test! 🎉
