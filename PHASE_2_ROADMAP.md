# 🎯 PHASE 2: Enhanced Note System - Detailed Roadmap

## Overview

Phase 2 focuses on enhancing the note system with templates, auto-linking, organization, and backlinks. This phase builds on Phase 1's solid foundation and estimated to take **3-4 weeks**.

**Status:** Ready to begin ✅

---

## Phase 2 Features Breakdown

### Feature 1: Note Templates

**What:** Create reusable note templates for different types of content commonly used in TTRPGs.

**Templates to Implement:**

- **Monster** - Name, HP, AC, abilities, weaknesses
- **NPC** - Name, personality, background, goals, relationships
- **Location** - Description, connections, NPCs present, secrets
- **Quest** - Objective, rewards, challenges, hooks
- **Item** - Name, properties, rarity, abilities
- **Encounter** - Participants, difficulty, location, rewards

**Files to Create/Modify:**

- `src/note-template-selector.tsx` - UI for choosing templates
- `src/note-template-editor.tsx` - Template-specific form fields
- `server/graphql/modules/note-templates.ts` - GraphQL for templates
- `server/migrations/6.ts` - Database schema for template metadata
- `server/io-types/note-template.ts` - Type definitions

**Complexity:** Medium | **Time:** 1 week

---

### Feature 2: Auto-Linking System (@mention syntax)

**What:** Allow DMs to link notes together using `@mention` syntax, with live autocomplete.

**Implementation:**

- Parse note content for `@NoteTitle` patterns
- Create bidirectional links (A links to B, B shows backlink to A)
- Implement live preview highlighting linked notes
- Add link validation (warn if linked note doesn't exist)

**Files to Create/Modify:**

- `src/note-editor-with-mentions.tsx` - Editor with @mention autocomplete
- `src/mention-autocomplete.tsx` - Autocomplete popup component
- `server/note-linking.ts` - Link parsing and validation logic
- `server/graphql/modules/note-links.ts` - GraphQL mutations for links
- `server/migrations/7.ts` - Database table for link relationships

**Complexity:** High | **Time:** 1.5 weeks

---

### Feature 3: Categories & Folder/Tree View

**What:** Organize notes into hierarchical categories with a tree view sidebar.

**Implementation:**

- Add category field to notes (e.g., "NPCs/Tavern", "Monsters/Dragons")
- Implement recursive folder structure rendering
- Add drag-and-drop to move notes between categories
- Support nested folders (any depth)
- Add search within categories

**Files to Create/Modify:**

- `src/note-tree-view.tsx` - Tree component for category hierarchy
- `src/category-breadcrumb.tsx` - Navigation breadcrumb
- `src/note-organizer.tsx` - Drag-drop reordering
- `server/graphql/modules/note-categories.ts` - Category queries/mutations
- `server/migrations/8.ts` - Add category field to notes table

**Complexity:** Medium | **Time:** 1 week

---

### Feature 4: Backlink System

**What:** Show all notes that link to the current note (reverse references).

**Implementation:**

- Automatically detect all notes referencing current note
- Display backlinks section in note view
- Show backlink count in note list
- Link to backlinks for quick navigation

**Files to Create/Modify:**

- `src/note-backlinks-panel.tsx` - Panel showing incoming links
- `server/note-backlink-resolver.ts` - Logic to find backlinks
- `server/graphql/modules/note-backlinks.ts` - GraphQL backlink queries
- Update `server/graphql/modules/notes.ts` - Add backlinks field to Note type

**Complexity:** Low | **Time:** 0.5 weeks

---

## Technology Stack

**Frontend:**

- React hooks for state management
- Chakra UI for components
- Relay for GraphQL queries
- React Spring for animations
- Draft.js or Slate for rich text @mention support

**Backend:**

- Express.js with Socket.IO
- GraphQL with gqtx
- SQLite with migrations
- fp-ts for functional programming patterns

**Database:**

- SQLite with new tables:
  - `note_templates` - Template definitions
  - `note_links` - Link relationships
  - `note_categories` - Category hierarchy
  - Modify `notes` table - Add template_type, category fields

---

## Implementation Strategy

### Phase 2.1: Foundation (Week 1)

**Goal:** Set up backend infrastructure and database schema for all Phase 2 features

1. Create database migration for note metadata

   - Add `template_type` field to notes
   - Add `category` field to notes
   - Create `note_links` table
   - Create `note_templates` table

2. Create io-ts types for new note structures

   - NoteTemplate type
   - NoteLink type
   - NoteCategoryNode type

3. Implement backend resolvers for basic operations

   - Get note templates
   - Create/update note with template
   - Get notes by category

4. Extend GraphQL schema
   - Add Template type to schema
   - Add templateType field to Note
   - Add category field to Note
   - Add basic template queries

**Estimated Time:** 3-4 days
**Testing:** Unit tests for io-ts decoders and db functions

---

### Phase 2.2: Note Templates UI (Week 1-2)

**Goal:** Implement template selection and form generation

1. Create NoteTemplateSelector component

   - Display 6 template options with icons
   - Handle template selection

2. Create NoteTemplateEditor component

   - Generate form fields based on template type
   - Implement form validation
   - Handle template-specific logic

3. Integrate templates into existing note creation flow

   - Show template selector on new note
   - Prepopulate fields based on template
   - Save template_type to database

4. Frontend testing
   - Create new notes with each template
   - Verify correct fields appear
   - Test form validation

**Estimated Time:** 3-4 days
**Testing:** Manual testing of all templates

---

### Phase 2.3: Auto-Linking (@mention) System (Week 2-3)

**Goal:** Implement @mention autocomplete and link parsing

1. Create mention-aware note editor

   - Integrate @mention detection on typing
   - Show autocomplete dropdown with matching notes
   - Insert links on selection

2. Implement link storage and resolution

   - Parse note content for @NoteTitle patterns
   - Extract and store link relationships in DB
   - Create GraphQL mutation for storing links

3. Implement bidirectional link support

   - When A links to B, B automatically shows backlink to A
   - Update links when note is renamed
   - Clean up links when notes are deleted

4. Add link validation
   - Warn if linked note doesn't exist
   - Suggest similar note titles
   - Handle broken links gracefully

**Estimated Time:** 4-5 days
**Testing:**

- Test autocomplete with various note names
- Create links and verify both directions
- Test renaming and deletion

---

### Phase 2.4: Category Organization (Week 3)

**Goal:** Implement hierarchical folder structure

1. Create TreeView component

   - Display categories hierarchically
   - Support nested folders
   - Show note count per category

2. Implement category management

   - Add/rename/delete categories
   - Move notes between categories
   - Support drag-drop reordering

3. Add breadcrumb navigation

   - Show current category path
   - Allow quick navigation between levels
   - Show category view options (tree vs list)

4. Implement search within categories
   - Filter notes by category
   - Search within selected category
   - Show results count

**Estimated Time:** 3-4 days
**Testing:** Manual testing of organization workflows

---

### Phase 2.5: Backlinks & Polish (Week 4)

**Goal:** Implement reverse link detection and final integration

1. Create BacklinksPanel component

   - Display all notes linking to current note
   - Show count of backlinks
   - Link to backlink sources

2. Implement backlink resolver

   - Query for all notes containing @CurrentNoteTitle
   - Cache backlinks for performance
   - Invalidate cache on note updates

3. Integration & testing

   - Add backlinks to note detail view
   - Test with complex link structures
   - Performance test with many links

4. Final polish
   - UI refinements
   - Performance optimization
   - Documentation updates

**Estimated Time:** 2-3 days
**Testing:** Full end-to-end testing with complex scenarios

---

## Database Schema Changes

### New Migrations Required

**Migration 6: Add Note Metadata**

```sql
-- Add fields to notes table
ALTER TABLE notes ADD COLUMN template_type TEXT DEFAULT NULL;
ALTER TABLE notes ADD COLUMN category TEXT DEFAULT NULL;

-- Create note_templates table
CREATE TABLE note_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  fields JSON NOT NULL,
  created_at INTEGER NOT NULL
);

-- Create note_links table
CREATE TABLE note_links (
  id TEXT PRIMARY KEY,
  from_note_id TEXT NOT NULL,
  to_note_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (from_note_id) REFERENCES notes(id),
  FOREIGN KEY (to_note_id) REFERENCES notes(id)
);
```

**Migration 7: Add Indexes for Performance**

```sql
CREATE INDEX idx_notes_template_type ON notes(template_type);
CREATE INDEX idx_notes_category ON notes(category);
CREATE INDEX idx_note_links_from ON note_links(from_note_id);
CREATE INDEX idx_note_links_to ON note_links(to_note_id);
```

---

## GraphQL Schema Extensions

### New Types

```graphql
enum NoteTemplateType {
  MONSTER
  NPC
  LOCATION
  QUEST
  ITEM
  ENCOUNTER
}

type NoteTemplate {
  id: ID!
  name: String!
  type: NoteTemplateType!
  fields: [TemplateField!]!
}

type TemplateField {
  name: String!
  type: String!
  label: String!
  required: Boolean!
  placeholder: String
}

type NoteLink {
  id: ID!
  fromNote: Note!
  toNote: Note!
}

type NoteCategoryNode {
  name: String!
  fullPath: String!
  children: [NoteCategoryNode!]!
  notes: [Note!]!
  noteCount: Int!
}
```

### New Queries

```graphql
query GetNoteTemplates {
  noteTemplates {
    id
    name
    type
    fields {
      name
      type
      label
    }
  }
}

query GetNoteBacklinks($noteId: ID!) {
  note(id: $noteId) {
    id
    backlinks {
      id
      title
      category
    }
  }
}

query GetNoteCategories {
  noteCategories {
    name
    fullPath
    children { ... }
    noteCount
  }
}
```

### New Mutations

```graphql
mutation CreateNoteFromTemplate($input: CreateNoteFromTemplateInput!) {
  createNoteFromTemplate(input: $input) {
    note { ... }
  }
}

mutation UpdateNoteCategory($noteId: ID!, $category: String!) {
  updateNoteCategory(noteId: $noteId, category: $category) {
    note { ... }
  }
}

mutation CreateNoteLink($fromNoteId: ID!, $toNoteId: ID!) {
  createNoteLink(fromNoteId: $fromNoteId, toNoteId: $toNoteId) {
    link { ... }
  }
}
```

---

## Testing Strategy

### Unit Tests

- Template type validation
- Link parsing and extraction
- Category path resolution
- Backlink finding algorithms

### Integration Tests

- Create note with template
- Create links between notes
- Organize notes into categories
- Verify backlink bidirectionality

### End-to-End Tests

- Full workflow: Template → Auto-links → Category → Backlinks
- Complex scenario with 50+ notes
- Performance testing with large link graphs

### Manual Testing

- UI responsiveness for tree view
- Autocomplete accuracy
- Drag-drop functionality
- Mobile responsiveness

---

## Performance Considerations

1. **Link Parsing:** Cache @mention links to avoid re-parsing on every view
2. **Backlink Resolution:** Index note links for fast lookup by target note
3. **Category Tree:** Paginate large category trees (100+ items)
4. **Search:** Implement full-text search with indexing
5. **Live Updates:** Use WebSocket subscriptions for collaborative editing

---

## Known Dependencies & Risks

### Dependencies on Phase 1

- ✅ Token system stable and working
- ✅ GraphQL infrastructure proven
- ✅ Database migration system working
- ✅ Frontend component patterns established

### Potential Risks

1. **Rich Text Editor Complexity:** Draft.js or Slate has learning curve
2. **Link Graph Performance:** Many-to-many links could cause performance issues
3. **Naming Conflicts:** Two notes with similar names in @mention
4. **Broken Link Handling:** Orphaned links if notes are deleted

### Mitigation Strategies

1. Use simpler markdown-based editor initially
2. Implement link graph caching and batching
3. Use UUIDs for unique identification
4. Implement cascade delete for broken links

---

## Estimated Timeline

| Week | Focus                                | Deliverables                                       |
| ---- | ------------------------------------ | -------------------------------------------------- |
| 1    | Database schema + Backend foundation | Migrations, io-ts types, base resolvers            |
| 1.5  | Template UI implementation           | Template selector, template editor                 |
| 2-3  | Auto-linking system                  | @mention editor, link storage, bidirectional links |
| 3    | Category organization                | Tree view, category management, drag-drop          |
| 4    | Backlinks + Polish                   | Backlink panel, performance optimization, docs     |

**Total Estimated Time:** 3-4 weeks (as planned)

---

## Success Criteria

✅ All note templates working (6/6 templates functional)
✅ @mention autocomplete working (tested with 50+ notes)
✅ Links bidirectional (A→B creates B→A backlink)
✅ Category tree working with drag-drop
✅ Backlinks displaying correctly
✅ No performance degradation with 100+ notes
✅ All tests passing (unit, integration, E2E)
✅ Zero console errors
✅ Mobile responsive

---

## Next Steps When Starting Phase 2

1. **Create git branch:** `git checkout -b phase-2-enhanced-notes`
2. **Update package.json:** Add any new dependencies (Draft.js, or similar)
3. **Database preparation:** Ensure migration system running smoothly
4. **Backend foundation:** Start with migration 6 and io-ts types
5. **Frontend setup:** Create component structure
6. **Testing framework:** Set up tests for new types and functions

---

## Reference Documentation

- **Phase 1 Patterns:** See CONSOLIDATED_ENHANCEMENT_PLAN.md for fp-ts, io-ts, GraphQL patterns
- **Component Examples:** TokenStatsPanel, InitiativeTracker show React patterns
- **Database:** Review existing migrations (1-5) and notes-db.ts for patterns
- **Testing:** See existing .spec.ts files for Jest patterns

---

**Phase 2 is ready to begin whenever you want to start!** 🚀
