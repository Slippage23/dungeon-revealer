# Phase 2: Quick Reference Guide

## 🎯 What Was Built

Three interconnected features for the Dungeon Revealer note system:

| Feature        | Purpose                                      | Status      |
| -------------- | -------------------------------------------- | ----------- |
| **Templates**  | Pre-built note structures with custom fields | ✅ Complete |
| **Categories** | Hierarchical organization system             | ✅ Complete |
| **Backlinks**  | Bidirectional note linking                   | ✅ Complete |

---

## 📁 File Structure

### Backend (server/)

```
migrations/
  6.ts          → Create note_templates table
  7.ts          → Create note_categories table (with parent_id)
  8.ts          → Create note_backlinks table

io-types/
  note-template.ts      → NoteTemplateType (with NoteTemplateFieldType[])
  note-category.ts      → NoteCategoryType (hierarchical)
  note-backlink.ts      → NoteBacklinkType

graphql/modules/
  note-template.ts      → Queries: noteTemplates, noteTemplate
                        → Mutations: createNoteTemplate, deleteNoteTemplate
  note-category.ts      → Queries: noteCategoryTree, noteCategories
                        → Mutations: create, update, delete
  note-backlink.ts      → Queries: backlinksTo, backlinksFrom
                        → Mutations: create, delete

Database layer (root server/)
  note-template-db.ts   → Template CRUD + cursor pagination
  note-category-db.ts   → Category CRUD + tree building
  note-backlink-db.ts   → Backlink queries
```

### Frontend (src/dm-area/note-editor/)

```
hooks/
  use-note-templates.ts       → 3 hooks: query, create, delete
  use-note-categories.ts      → 4 hooks: query, create, update, delete
  use-note-backlinks.ts       → 2 hooks: backlinksTo, backlinksFrom
  __generated__/              → 9 Relay types (auto-generated)

Components/
  note-template-list.tsx                → Display templates
  note-template-create-modal.tsx        → Create with field builder
  note-templates-panel.tsx              → Tabbed integration

  note-category-tree-view.tsx           → Recursive tree rendering
  note-category-create-modal.tsx        → Create nested categories
  note-categories-panel.tsx             → Tabbed integration

  note-backlinks-panel.tsx              → Show incoming/outgoing links

Integration/
  enhanced-note-editor-sidebar.tsx      → Master component (3 tabs)
```

---

## 🚀 Quick Start

### For Backend Developers

1. **Review database schema**:

   ```bash
   cat server/migrations/{6,7,8}.ts
   ```

2. **Understand GraphQL API**:

   ```bash
   cat server/graphql/modules/note-{template,category,backlink}.ts
   ```

3. **Check database operations**:
   ```bash
   cat server/note-{template,category,backlink}-db.ts
   ```

### For Frontend Developers

1. **Use the hooks** in your components:

   ```tsx
   import { useNoteTemplates } from "./hooks/use-note-templates";

   const { templates } = useNoteTemplates(mapId);
   const { mutate: createTemplate } = useCreateNoteTemplate();
   ```

2. **Import components** for UI:

   ```tsx
   import { NoteTemplatesPanel } from "./note-template-list";
   import { NoteCategoriesPanel } from "./note-categories-panel";
   import { NoteBacklinksPanel } from "./note-backlinks-panel";
   ```

3. **Or use the master sidebar**:

   ```tsx
   import { EnhancedNoteEditorSidebar } from "./enhanced-note-editor-sidebar";

   <EnhancedNoteEditorSidebar
     mapId={mapId}
     currentNoteId={noteId}
     onTemplateApply={handleTemplate}
     onCategorySelect={handleCategory}
     onLinkedNoteClick={handleLink}
   />;
   ```

---

## 💻 Commands

### Build & Test

```bash
# Build backend
npm run build:backend

# Build frontend
npm run build:frontend

# Regenerate GraphQL schema
npm run write-schema

# Run all tests
npm test

# Type check
npm run type-check
```

### Development

```bash
# Start backend dev server
npm run start:server:dev

# Start frontend dev server (separate terminal)
npm run start:frontend:dev

# Watch mode for backend
npm run dev:backend
```

### Git

```bash
# Current branch
git branch

# Push phase-2
git push origin phase-2

# View Phase 2 commits
git log --oneline phase-2 | head -10
```

---

## 🔌 Integration Checklist

To integrate Phase 2 features into your note editor:

- [ ] **Import the sidebar component**

  ```tsx
  import { EnhancedNoteEditorSidebar } from "./note-editor/enhanced-note-editor-sidebar";
  ```

- [ ] **Add sidebar to layout**

  ```tsx
  <HStack h="full">
    <NoteEditor mapId={mapId} currentNoteId={noteId} />
    <EnhancedNoteEditorSidebar
      mapId={mapId}
      currentNoteId={noteId}
      onTemplateApply={applyTemplate}
      onCategorySelect={selectCategory}
      onLinkedNoteClick={navigateToNote}
    />
  </HStack>
  ```

- [ ] **Test template creation**
- [ ] **Test category hierarchy**
- [ ] **Test backlink navigation**
- [ ] **Verify type generation**: `npm run build:frontend`

---

## 🐛 Common Issues

### Build Fails: "Unknown type"

**Solution**: Regenerate schema

```bash
npm run write-schema
npm run build:frontend
```

### Build Fails: "Unknown field"

**Reason**: Wrong field names used (NoteCategory vs NoteCategoryNode)

**Solution**: Check field names match type definitions in io-types/

### Relay Types Not Generated

**Solution**:

1. Check operation names match pattern: `useModuleName_OperationType`
2. Run: `npm run build:frontend`
3. Check `__generated__` folder for new files

---

## 📊 Data Flow

### Template Creation Flow

```
User Input
  ↓
GraphQL Mutation (createNoteTemplate)
  ↓
GraphQL Resolver → Database Layer
  ↓
Insert into note_templates table
  ↓
Relay Cache Update
  ↓
UI Re-render (template in list)
```

### Category Tree Fetch

```
Component Mount
  ↓
GraphQL Query (noteCategoryTree)
  ↓
Database buildCategoryTree()
  ↓
Recursive structure with children[]
  ↓
Relay Cache (normalized)
  ↓
Tree Component renders CategoryNode recursively
```

### Backlink Display

```
Note Selected
  ↓
GraphQL Queries (backlinksTo, backlinksFrom)
  ↓
Parallel queries fetch incoming/outgoing
  ↓
Panel shows both with visual distinction
  ↓
User can click → navigate to linked note
```

---

## 🎨 Component Props

### EnhancedNoteEditorSidebar

```tsx
interface Props {
  mapId: string;
  currentNoteId?: string;
  onTemplateApply?: (template: NoteTemplate) => void;
  onCategorySelect?: (category: NoteCategory) => void;
  onLinkedNoteClick?: (noteId: string) => void;
}
```

### NoteTemplatesPanel

```tsx
interface Props {
  mapId: string;
  onTemplateApply?: (template: NoteTemplate) => void;
}
```

### NoteCategoriesPanel

```tsx
interface Props {
  mapId: string;
  onCategorySelect?: (category: NoteCategory) => void;
}
```

### NoteBacklinksPanel

```tsx
interface Props {
  noteId: string;
  onLinkedNoteClick?: (noteId: string) => void;
}
```

---

## 🔍 Debugging Tips

### Check GraphQL Operations

```bash
# List available operations
ls src/dm-area/note-editor/hooks/__generated__/

# Check generated type
cat src/dm-area/note-editor/hooks/__generated__/useNoteTemplatesQuery.graphql.ts
```

### Verify Database Schema

```bash
# Check table structure
sqlite3 data/db.sqlite ".schema note_templates"

# Query data
sqlite3 data/db.sqlite "SELECT * FROM note_templates;"
```

### Frontend DevTools

1. Open browser DevTools → Network tab
2. Look for WebSocket messages with GraphQL operations
3. Check Relay store in React DevTools plugin

---

## 📚 Documentation Files

| File                                | Purpose                                  |
| ----------------------------------- | ---------------------------------------- |
| `PHASE_2_IMPLEMENTATION_GUIDE.md`   | Detailed architecture and decisions      |
| `PHASE_2_COMPLETION_SUMMARY.md`     | Executive summary with testing checklist |
| `PHASE_2_COMPLETE_STATUS_REPORT.md` | Final verification and metrics           |
| `PHASE_2_QUICK_REFERENCE.md`        | This file - quick lookup                 |

---

## ✅ Verification Checklist

Before deploying Phase 2:

- [ ] Backend builds without errors: `npm run build:backend`
- [ ] Frontend builds without errors: `npm run build:frontend`
- [ ] GraphQL schema updated: `npm run write-schema` runs
- [ ] All 9 Relay types generated in `__generated__` folders
- [ ] No TypeScript errors: `npm run type-check`
- [ ] All tests pass: `npm test`
- [ ] Manual browser testing completed:
  - [ ] Create template → see in list
  - [ ] Delete template → removed from list
  - [ ] Create category → see in tree
  - [ ] Nested categories work
  - [ ] View backlinks → navigation works

---

## 🚢 Deployment Readiness

```
✅ Code: 100% Complete
✅ Types: TypeScript + io-ts validation
✅ Tests: All passing
✅ Build: Both frontend + backend successful
✅ Documentation: Comprehensive guides included
✅ Git: All commits clean and documented

Status: READY FOR INTEGRATION TESTING
```

---

## 📞 Support

For issues or questions:

1. Check `PHASE_2_IMPLEMENTATION_GUIDE.md` troubleshooting section
2. Review inline code comments in component files
3. Check git history for decisions: `git log --oneline phase-2`
4. Search for similar patterns in existing code

---

**Last Updated**: November 18, 2025  
**Phase 2 Status**: ✅ COMPLETE  
**Branch**: origin/phase-2  
**Commit**: 9cd3e40
