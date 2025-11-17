# 📋 Phase 2 Quick Reference

## What's Left for Phase 2: Enhanced Note System

### The 4 Main Features

#### 1️⃣ **Note Templates** (Monsters, NPCs, Locations, Quests, Items, Encounters)

- Create reusable forms for different note types
- Template-specific fields and validation
- Drop-down selector when creating new notes
- **Time:** ~1 week

#### 2️⃣ **Auto-Linking (@mention syntax)**

- Type `@NoteName` to link to another note
- Live autocomplete showing matching notes
- Bidirectional links (A→B creates B→A automatically)
- **Time:** ~1.5 weeks

#### 3️⃣ **Category Organization**

- Hierarchical folder structure for notes
- Tree view sidebar (e.g., "NPCs/Tavern", "Monsters/Dragons")
- Drag-and-drop to move notes between folders
- **Time:** ~1 week

#### 4️⃣ **Backlinks System**

- Shows all notes that link TO the current note
- "2 notes link here" indicators
- Quick navigation to linking notes
- **Time:** ~0.5 weeks

---

## Implementation Phases

```
Week 1        → Database + Backend Foundation
              → Create migrations, io-ts types, basic resolvers

Week 1-2      → Template UI
              → Build template selector and editor components

Week 2-3      → Auto-Linking (@mention)
              → Implement autocomplete and link storage

Week 3        → Categories & Tree View
              → Build folder organization UI

Week 4        → Backlinks & Polish
              → Implement backlink panel and optimization
```

**Total: 3-4 weeks**

---

## Key Database Changes Needed

- Add `template_type` field to notes
- Add `category` field to notes
- Create `note_links` table (stores which note links to which)
- Create `note_templates` table (defines templates)
- Add indexes for performance

---

## Frontend Component Structure

```
src/
├── note-template-selector.tsx    (Choose template type)
├── note-template-editor.tsx      (Fill out template fields)
├── note-editor-with-mentions.tsx (Rich editor with @autocomplete)
├── note-tree-view.tsx            (Category hierarchy)
├── note-backlinks-panel.tsx      (Show incoming links)
└── mention-autocomplete.tsx      (@mention dropdown)
```

---

## Backend Work Needed

```
server/
├── migrations/
│   ├── 6.ts (Note metadata schema)
│   └── 7.ts (Performance indexes)
├── io-types/
│   └── note-template.ts
├── graphql/modules/
│   ├── note-templates.ts (Template queries)
│   ├── note-links.ts (Link mutations)
│   ├── note-categories.ts (Category queries)
│   └── note-backlinks.ts (Backlink queries)
└── note-linking.ts (Link parsing logic)
```

---

## GraphQL Additions

### New Types

```graphql
enum NoteTemplateType {
  MONSTER, NPC, LOCATION, QUEST, ITEM, ENCOUNTER
}

type NoteTemplate { id, name, type, fields }
type NoteLink { id, fromNote, toNote }
type NoteCategoryNode { name, children, notes, noteCount }
```

### New Queries

```graphql
noteTemplates()
note(id).backlinks()
noteCategories()
```

### New Mutations

```graphql
createNoteFromTemplate(input)
updateNoteCategory(noteId, category)
createNoteLink(fromNoteId, toNoteId)
```

---

## Testing Checklist

- [ ] Create notes with each of 6 templates
- [ ] Verify template-specific fields appear
- [ ] @mention autocomplete shows matching notes
- [ ] Links work bidirectionally
- [ ] Notes can be organized into categories
- [ ] Tree view shows correct hierarchy
- [ ] Backlinks appear for linked notes
- [ ] Performance OK with 100+ notes
- [ ] All console clean, no errors

---

## Success Metrics

✅ All 6 note templates implemented
✅ @mention autocomplete working
✅ Bidirectional linking working
✅ Category tree functional with drag-drop
✅ Backlinks displaying correctly
✅ Performance good (100+ notes)
✅ All tests passing
✅ Zero console errors

---

## Starting Phase 2

When ready, execute:

```bash
# Create feature branch
git checkout -b phase-2-enhanced-notes

# Start with database migration
# 1. Create server/migrations/6.ts
# 2. Create server/io-types/note-template.ts
# 3. Implement backend resolvers
# 4. Build frontend components
```

---

## Key Learnings from Phase 1 to Apply

✅ Use fp-ts/ReaderTaskEither for db operations
✅ Use io-ts for type-safe decoders
✅ Use Relay GraphQL with @live directive
✅ Test through manual browser verification
✅ Multiple code paths → need unified approach
✅ GraphQL enums are case-sensitive
✅ Document each session's findings

---

## Reference Files

- `CONSOLIDATED_ENHANCEMENT_PLAN.md` - Full project context
- `PHASE_1_VERIFICATION_REPORT.md` - Phase 1 architecture patterns
- `src/dm-area/token-stats-panel.tsx` - React component patterns
- `server/token-data-db.ts` - Database layer example
- `server/graphql/modules/token-data.ts` - GraphQL patterns

---

**Phase 1: ✅ COMPLETE**
**Phase 2: 🚀 READY TO START**

Happy coding! 🎉
