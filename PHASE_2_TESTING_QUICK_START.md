# 🚀 PHASE 2 MANUAL TESTING - QUICK START

## ✅ Servers Are Running

```
✅ Backend:  http://localhost:3000
✅ Frontend: http://localhost:4000
✅ DM Area:  http://localhost:4000/dm
```

The dev servers are now running in the background. You can:

- Edit code and see live updates (hot reload)
- Test features in real-time
- Check console for errors (F12)

---

## 🧪 Quick Test Path

### 1. Test Templates (5 min)

- Look for "Templates" tab in right sidebar
- Create a template called "Quick Test"
- Add a text field
- Delete it

**Success**: Template appears in list, can delete ✅

### 2. Test Categories (5 min)

- Look for "Categories" tab in right sidebar
- Create category "Test"
- Create nested category "Sub-Test"
- Expand the tree

**Success**: Tree shows nested structure ✅

### 3. Test Backlinks (5 min)

- Look for "Links" tab in right sidebar
- Select a note to see incoming/outgoing links
- (Or create notes with links if feature exists)

**Success**: Links display without errors ✅

### 4. Test Integration (5 min)

- All 3 tabs visible in sidebar
- Tab switching works smoothly
- No console errors (F12)

**Success**: All features integrated ✅

---

## 🔍 How to Check for Issues

### Browser Console (F12)

- Press **F12** to open DevTools
- Click **Console** tab
- Look for any red error messages
- Screenshot any errors you find

### Network Tab (F12 → Network)

- Look for GraphQL operations
- Should see `noteTemplates`, `noteCategories`, etc.
- All should return green (200 status)

### Database (Optional)

```bash
# In new terminal, check database directly:
sqlite3 c:\Temp\git\dungeon-revealer\data\db.sqlite

# List templates:
SELECT * FROM note_templates;

# List categories:
SELECT * FROM note_categories;

# List backlinks:
SELECT * FROM note_backlinks;
```

---

## 📋 Simple Checklist

As you test, mark off what works:

- [ ] **Templates Tab Visible**

  - Right sidebar shows "Templates" tab
  - Can click between tabs

- [ ] **Can Create Template**

  - Click "New Template"
  - Fill in name and description
  - Template appears in list

- [ ] **Categories Tab Works**

  - Right sidebar shows "Categories" tab
  - Can create categories
  - Tree renders hierarchically

- [ ] **No Console Errors**

  - Press F12
  - Console tab is clean (no red errors)
  - Warnings are OK, errors are not

- [ ] **Data Persists**
  - Refresh page (Ctrl+R)
  - Templates/categories still there
  - Data wasn't lost

---

## 🎯 What Success Looks Like

✅ **Minimum Success**

- At least one feature (templates OR categories) works
- Can create and view data
- No major console errors

✅ **Standard Success**

- All 3 tabs visible and switchable
- Can create data in each feature
- Sidebar integrates smoothly
- No console errors

✅ **Excellent Success**

- All features fully functional
- Real-time updates work
- Performance is snappy (< 100ms)
- Data persists after refresh
- Sidebar feels polished

---

## 🐛 Common Issues & Fixes

### "I don't see the sidebar"

**Check 1**: Scroll right

- Sidebar might be to the right, off screen
- Scroll or resize window

**Check 2**: Check console (F12)

- Look for errors
- See troubleshooting guide

**Check 3**: Check if wired

- Main editor may not include sidebar yet
- Check if component needs to be imported

### "GraphQL errors in console"

**Fix**: Regenerate schema

```bash
# In new terminal:
cd c:\Temp\git\dungeon-revealer
npm run write-schema
```

Then refresh browser (F5)

### "Templates/categories created but not showing"

**Check Database**:

```bash
sqlite3 c:\Temp\git\dungeon-revealer\data\db.sqlite
SELECT * FROM note_templates;
```

If data is in database:

- Relay cache issue
- Refresh browser (F5)
- Clear local storage (DevTools → Application → Storage → Local Storage → Clear)

### "Servers won't start"

**Check if ports are free**:

```bash
# Check port 3000 (backend)
netstat -ano | findstr :3000

# Check port 4000 (frontend)
netstat -ano | findstr :4000

# If process exists, can kill with:
taskkill /PID <PID> /F
```

---

## 📞 When You're Done Testing

1. **Document Results**

   - Note what worked
   - Note what didn't
   - Take screenshots of errors

2. **Report Back**

   - Did templates work?
   - Did categories work?
   - Did backlinks work?
   - Any console errors?
   - Any other issues?

3. **Next Steps**
   - If all works → Ready to merge
   - If issues → We'll fix them
   - If partial → We'll prioritize

---

## 🔗 Key URLs

| Purpose          | URL                           |
| ---------------- | ----------------------------- |
| DM Area          | http://localhost:4000/dm      |
| Player Area      | http://localhost:4000         |
| Backend API      | http://localhost:3000         |
| GraphQL Endpoint | http://localhost:3000/graphql |

---

## 💡 Tips

- **Hot Reload**: Edit code, save, browser auto-updates
- **DevTools**: F12 is your friend - check console constantly
- **Performance**: Open DevTools → Performance tab to measure speed
- **Network**: DevTools → Network tab shows GraphQL operations

---

## 🎯 Start Here

1. Open browser at: **http://localhost:4000/dm**
2. Look for sidebar on the right
3. Click "Templates" tab
4. Try creating a template
5. Document what happens

Then report back! 📝

---

**Testing Guide**: See `PHASE_2_MANUAL_TESTING_GUIDE.md` for detailed scenarios

**Questions?** Check that file for troubleshooting section
