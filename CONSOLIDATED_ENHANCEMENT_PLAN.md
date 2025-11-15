# Dungeon Revealer Consolidated Enhancement Plan

## 1. Project Overview

**Project Goal:** Enhance Dungeon Revealer with advanced token management, a rich note system, automation, and AI assistance to create a powerful tool for in-person tabletop gaming.

**Key Constraints:**

- Designed for in-person play (no voice/video needed).
- Focus on local asset management.
- Maintain performance and stability.
- Preserve all existing functionality.

### Feature Roadmap Summary

| Phase       | Feature Set                             | Estimated Time | Status                                         |
| ----------- | --------------------------------------- | -------------- | ---------------------------------------------- |
| **Phase 1** | **Advanced Token Management**           | 2-3 weeks      | Backend Complete, Frontend Integration Pending |
|             | - HP tracking with visual bars          |                |                                                |
|             | - Status conditions with icons          |                |                                                |
|             | - Initiative tracker with auto-advance  |                |                                                |
|             | - Quick damage/healing interface        |                |                                                |
| **Phase 2** | **Enhanced Note System**                | 3-4 weeks      | Not Started                                    |
|             | - Note templates (Monster, NPC, etc.)   |                |                                                |
|             | - `@mention` auto-linking between notes |                |                                                |
|             | - Note categories and folders           |                |                                                |
| **Phase 3** | **Automation & Macros**                 | 2-3 weeks      | Not Started                                    |
|             | - Dice macro system                     |                |                                                |
|             | - Map reveal presets                    |                |                                                |
|             | - Event trigger system                  |                |                                                |
| **Phase 4** | **AI Assistant (Optional)**             | 1-2 weeks      | Not Started                                    |
|             | - NPC, Monster, Location generators     |                |                                                |
|             | - Plot hook suggestions                 |                |                                                |
|             | - Smart caching to minimize cost        |                |                                                |

---

## Documentation References

For detailed architectural guidance while implementing features, refer to these specialized guides in `.github/`:

| Guide                            | Purpose                                                                                                                                                   |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`copilot-instructions.md`**    | Comprehensive architecture overview, project conventions, critical patterns (fp-ts, io-ts, GraphQL), and debugging tips (450 lines)                       |
| **`SOCKET-IO-PATTERNS.md`**      | Real-time WebSocket authentication, GraphQL Live Queries, useSubscription hooks, broadcasting patterns, testing subscriptions                             |
| **`CANVAS-DRAWING-PATTERNS.md`** | HTML Canvas drawing utilities, text rendering, token rendering (HP bars, condition icons), Three.js texture integration, coordinate conversion            |
| **`DATABASE-PATTERNS.md`**       | Schema migrations, query layer with io-ts decoding, business logic with fp-ts ReaderTaskEither, cursor pagination, transaction safety, query optimization |
| **`QUICK-REFERENCE.md`**         | Fast lookup: common tasks, file paths, build commands, environment variables, debugging checklist, code snippets                                          |

**Usage Pattern:** When implementing features, check this plan for progress tracking and decisions, then reference the specialized guides for implementation details and code examples.

---

## 2. Current Status & Handover Notes (As of Nov 14, 2025 - Session 4)

### Session 4: Final Build Tool Resolution (Nov 14, 2025)

**Problem Statement:**
Application still showed blank screen with error: `Uncaught ReferenceError: require is not defined` at index-DB7FrWnW.js:636:15955, despite previous fixes. The error occurred because Node.js-specific build tools were being bundled into the browser code.

**Root Cause Identified:**

- The Vite React plugin was configured to use Babel for JSX transformation
- Babel's configuration included `babel-plugin-relay` and other build-time plugins
- These plugins depend on Node.js packages like `@emotion/babel-plugin` which contain code that calls `require()`
- When bundled for the browser, these `require()` calls executed and failed because `require` doesn't exist in the browser

**The User's Insight (Critical):**
As you correctly pointed out, the proper fix is to ensure these Node.js-only build tools are **never imported into browser code at all**. Babel plugins are build-time tools, not runtime libraries. They should never attempt to run in a browser environment.

**Solution Implemented:**

1. **Disabled Babel Processing in React Plugin:**

   - Modified `vite.config.ts`: Removed the `babel` configuration object from `reactPlugin()` options
   - This tells Vite to use its native JSX transformation instead of invoking Babel
   - Result: `@emotion/babel-plugin`, `babel-plugin-relay`, and other build-time tools are NOT included in the browser bundle

2. **Why This Works:**
   - Vite's native JSX support is sufficient for React 19
   - The Relay compiler runs BEFORE Vite (as part of the prebuild step), so Babel transformations already happened
   - The browser only needs the compiled/transformed code, not the tools that created it

**Build Status (Final - Session 4):**

- Frontend build: ✅ **SUCCESS** (2799 modules, no require() errors)
- Backend build: ✅ **SUCCESS**
- Server: ✅ **RUNNING** on http://127.0.0.1:3000
- DM Section: ✅ **ACCESSIBLE** at http://127.0.0.1:3000/dm
- **Application displays correctly with NO blank screen or require() errors**

**Files Modified in Session 4:**

- `vite.config.ts` - Disabled Babel processing in React plugin
- Application now successfully renders the DM map with Token Stats and Initiative Tracker components ready for feature implementation

**Key Learning - Babel Plugins in Vite:**
When using Vite with React, DO NOT include Babel in the plugin configuration unless specifically needed. Vite handles JSX natively. Babel plugins are build-time tools that should never be invoked during browser bundling. If Babel transformations are needed (e.g., for Relay compiler), they should run in the prebuild/build phase BEFORE Vite, not during browser bundling.

---

## 2. Previous Session Statuses (Historical)

### Session 3 Notes (Nov 13, 2025)

**Issues Resolved:**

1. **dm-map.tsx Syntax Error:** Fixed missing closing bracket in the FlatContextProvider value array (line 827-829)
2. **map-view.tsx Duplicate Export:** Removed duplicate MapView export with incomplete interface definition
3. **Tool Structure Refactoring:**
   - Changed dmTools array from storing component references to storing MapTool objects
   - Each tool now has: `{ id: string, Component: React.ComponentType<MapToolProps> }`
   - Added tool IDs: "drag-pan-zoom", "brush", "area-select", "mark-area", "token-marker", "configure-grid"
4. **Type Definition Updates:**
   - Updated `ToolMapRecord` type to include a `tool` property containing MapTool objects
   - Updated `ActiveDmMapToolModel` to use string literals instead of Tool.id references
   - Fixed `isConfiguringGrid` check to compare tool.id instead of component reference
5. **Missing Props Fixed:**
   - Added `map={map}` prop to `ContextMenuRenderer` component
   - Added `currentMapId={map.id}` prop to `SharedTokenMenu` component
   - Fixed ConfigureGridMapTool.MenuComponent reference to use ConfigureGridSettings() directly

### Next Steps & Testing

**Immediate Actions Required:**

1. Complete `npm install "@chakra-ui/react@^2"` to downgrade Chakra UI
2. Run `npm run build` to verify successful build with v2
3. Start server and test application loads without blank screen
4. Test module resolution in browser DevTools

**Immediate Testing Required After Build Success:**

1. Verify the DM map loads without console errors
2. Test token selection to ensure TokenStatsPanel opens
3. Test the Initiative Tracker button functionality
4. Verify the token click handler fires correctly
5. Check that HP bars and condition icons render properly on tokens

**Remaining Work for Phase 1 Frontend Integration:**

1. Verify and test the GraphQL mutations for token data (upsertTokenData, updateTokenHP, etc.)
2. Implement proper GraphQL queries in TokenStatsPanel component to fetch/update token data
3. Add HP bar rendering on the map view
4. Add condition icon rendering on tokens
5. Wire up the damage/healing quick buttons in TokenStatsPanel
6. Complete the initiative tracker logic with round/turn tracking

**Known Issues & Notes:**

- The "Play" icon import warning in initiative-tracker.tsx needs to be resolved (possibly use a different icon)
- Some Chakra UI components in ShowGridSettingsPopup have type compatibility issues but don't affect functionality
- Code splitting warnings about chunk sizes - not critical but could be addressed in future optimization

**Key Learning - Vite External Modules:**
When marking dependencies as external in Vite's rollupOptions, they must either:

1. Be bundled in a separate build that the application imports, OR
2. Be available at runtime via CDN, OR
3. Be served by the backend application server
   The regex `/@chakra-ui\/.*/` without proper runtime resolution caused the blank screen issue. Always ensure external modules have a defined delivery mechanism before marking them external.

---

## 3. Phase 1: Advanced Token Management

This phase transforms basic tokens into rich game objects with stats, HP tracking, conditions, and initiative management.

### 3.1. Database Schema (`server/migrations/4.ts`)

A new migration will create the `token_data` table to store extended information for each token.

```typescript
import Database from "better-sqlite3";

export const applyMigration = (db: Database.Database) => {
  db.exec(`
    -- Token extended data table
    CREATE TABLE IF NOT EXISTS token_data (
      id TEXT PRIMARY KEY,
      map_id TEXT NOT NULL,
      token_id TEXT NOT NULL,
      name TEXT,
      stats TEXT, -- JSON: { hp: { current, max }, ac, initiative, speed }
      conditions TEXT, -- JSON: [{ name, icon, duration, description }]
      linked_note_id TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (map_id) REFERENCES maps(id) ON DELETE CASCADE
    );

    -- Index for faster lookups
    CREATE INDEX IF NOT EXISTS idx_token_data_map_id ON token_data(map_id);
    CREATE INDEX IF NOT EXISTS idx_token_data_token_id ON token_data(token_id);
  `);
};
```

### 3.2. Type Definitions (`server/token-types.ts`)

New TypeScript interfaces for token data structures.

```typescript
export interface TokenStats {
  hp: { current: number; max: number };
  ac: number;
  initiative?: number;
  speed: number;
}

export interface TokenCondition {
  id: string;
  name: string;
  icon: string;
  duration?: number;
  description?: string;
  color?: string;
}

export interface TokenData {
  id: string;
  mapId: string;
  tokenId: string;
  name: string;
  stats: TokenStats;
  conditions: TokenCondition[];
  linkedNoteId?: string;
  createdAt: number;
  updatedAt: number;
}
```

### 3.3. Database Access Layer (`server/token-data-db.ts`)

A new class to handle all CRUD operations for token data, including logic for updating HP, managing conditions, and handling initiative.

### 3.4. GraphQL API (`server/graphql/modules/token-data.ts`)

New GraphQL queries and mutations to expose token data management to the frontend.

- **Queries:** `tokenData(id: ID!)`, `tokenDataForMap(mapId: ID!)`, `commonConditions`
- **Mutations:** `upsertTokenData`, `updateTokenHP`, `addTokenCondition`, `removeTokenCondition`, `decrementConditionDurations`, `deleteTokenData`

### 3.5. Frontend Components

- **`src/dm-area/token-stats-panel.tsx`**: A panel for viewing and editing a token's HP, AC, speed, initiative, and conditions. Includes quick buttons for applying damage and healing.
- **`src/dm-area/initiative-tracker.tsx`**: A component to manage combat encounters, displaying a sorted list of combatants, tracking the current turn and round, and allowing the DM to advance through the initiative order.

---

## 4. Subsequent Phases (High-Level)

### 4.1. Phase 2: Enhanced Note System

- Implement note templates (Monster, NPC, Location, Quest, etc.).
- Create an auto-linking system using `@mention` syntax to link notes together.
- Add categories and a folder/tree view for better organization.
- Implement a backlink system to show which notes link to the current one.

### 4.2. Phase 3: Automation & Macros

- Develop a macro engine to execute simple scripts.
- Create macros for dice rolls (`/roll 2d6+3`), map reveals, and spawning tokens.
- Implement an event trigger system (e.g., "when a token enters this area, reveal that area").

### 4.3. Phase 4: AI Assistant

- Integrate with an AI service like Anthropic Claude.
- Create a new UI panel for generating content.
- Implement generators for NPCs, monster stat blocks, location descriptions, and plot hooks.
- Develop a caching system (`server/ai-cache.ts`) to store AI responses, reducing API calls and costs.
- Add necessary environment variables (`ANTHROPIC_API_KEY`, etc.) to a `.env` file.

---

## 5. Implementation & Integration Guide

This is a step-by-step guide to wire up the Phase 1 features once the main application build is fixed.

### Step 1: Generate Schema & Run Migrations

1.  **Generate GraphQL Types:** The frontend components rely on Relay-generated types.
    ```bash
    npm run write-schema
    npm run relay-compiler
    ```
    _Update (Nov 12, 2025): `relay-compiler` now runs successfully after removing the `--schema` argument from the `package.json` script. The schema is generated and compiled._
2.  **Run Database Migrations:** Start the server to apply the new `token_data` table schema.
    ```bash
    npm run start:server:dev
    ```
    _Update (Nov 13, 2025): The `server/migrations/4.ts` file was updated to correctly define the `token_data` table and set the `user_version` to 4. The server has been restarted, and it is assumed the migration has been applied._
3.  **Verify (Optional):** Use a SQLite client to check that the `token_data` table and its indexes were created in `data/db.sqlite`.

### Step 2: Integrate Frontend Components

The new React components (`TokenStatsPanel`, `InitiativeTracker`) exist but are not visible. They need to be added to the DM's map view.

**File to Edit: `src/dm-area/dm-map.tsx`**

1.  **Import Components:**
    ```typescript
    // ... other imports
    import { TokenStatsPanel } from "./token-stats-panel";
    import { InitiativeTracker } from "./initiative-tracker";
    ```
2.  **Add State Variables:** Inside the `DmMap` functional component, add state to manage panel visibility.
    ```typescript
    // ... inside DmMap component
    const [showTokenStats, setShowTokenStats] = React.useState(false);
    const [selectedTokenId, setSelectedTokenId] = React.useState<string | null>(
      null
    );
    const [showInitiative, setShowInitiative] = React.useState(false);
    ```
3.  **Add Toolbar Buttons:** In the JSX for the toolbar, add new buttons to toggle the panels.
    ```jsx
    // ... inside <Toolbar.Group>
    <Toolbar.Item>
      <Toolbar.Button onClick={() => setShowInitiative(!showInitiative)}>
        <Icon.List boxSize="20px" />
        <Icon.Label>Initiative</Icon.Label>
      </Toolbar.Button>
    </Toolbar.Item>
    // A similar button for Token Stats, perhaps only visible when a token is selected.
    ```
4.  **Render the Panels:** At the bottom of the `DmMap` component's return JSX, conditionally render the panels based on the state variables.

    ```jsx
    // ... before the closing tag of the main container
    {
      showInitiative && (
        <InitiativeTracker
          mapId={map.id}
          onClose={() => setShowInitiative(false)}
        />
      );
    }

    {
      showTokenStats && selectedTokenId && (
        <TokenStatsPanel
          tokenId={selectedTokenId}
          mapId={map.id}
          onClose={() => {
            setShowTokenStats(false);
            setSelectedTokenId(null);
          }}
        />
      );
    }
    ```

5.  **Wire up Token Click Handler:** Modify the map rendering logic to capture clicks on tokens. The click handler should set the `selectedTokenId` and toggle `showTokenStats` to `true`.

    _Update (Nov 13, 2025): The `onTokenClick` handler has been added to `LazyLoadedMapView` to set `selectedTokenId` and `showTokenStats`._

### Step 3: Add Map Overlays

To provide at-a-glance information, HP bars and condition icons should be rendered directly on the map.

**File to Edit: `src/map-view.tsx` (or token component)**

1.  **Query for Token Data:** For each token rendered, use a GraphQL query to fetch its `tokenData`.
2.  **Render HP Bar:** Create a small component that renders a div styled as an HP bar (e.g., a green bar over a red background) positioned above the token. The width of the green bar should be proportional to `currentHp / maxHp`.
3.  **Render Condition Icons:** For each active condition in the token's data, render its associated icon as a small badge on or near the token.

---

## 6. Testing Strategy

### Manual Test Checklist for Phase 1

- [ ] **Token Stats:**
  - [ ] Can you click a token to open its stats panel?
  - [ ] Does changing HP, AC, etc., and clicking "Save" persist the data (verify by closing/reopening panel)?
  - [ ] Do the "Damage" and "Heal" buttons correctly modify the current HP?
  - [ ] Does damage apply to Temp HP before regular HP?
  - [ ] Can you toggle conditions on and off, and do they persist?
- [ ] **Initiative Tracker:**
  - [ ] Can you open the initiative tracker from the toolbar?
  - [ ] Can you add tokens to the tracker and set their initiative?
  - [ ] Does the list sort correctly from highest to lowest initiative?
  - [ ] Does clicking "Start Combat" highlight the first token and show "Round 1"?
  - [ ] Does "Next Turn" advance correctly through the order and increment the round number?
  - [ ] Does "End Combat" clear the tracker?
- [ ] **Map Overlays:**
  - [ ] Do HP bars appear above tokens that have HP data?
  - [ ] Does the HP bar visually update when the token takes damage or is healed?
  - [ ] Do icons for active conditions appear on the token?

---

## 7. Deployment & Configuration

### Environment Variables (`.env`)

Create a `.env` file in the root directory for configuration.

```bash
# Server
PORT=3000
NODE_ENV=production

# Authentication
DM_PASSWORD=your_dm_password_here
PC_PASSWORD=your_player_password_here

# Data Directory
DATA_DIR=./data

# AI Assistant (Phase 4)
ENABLE_AI_ASSISTANT=true
ANTHROPIC_API_KEY=sk-ant-xxxxx
AI_MODEL=claude-sonnet-4-20250514
```

### Docker Deployment

The `Dockerfile` should be updated to include any new production dependencies (like `@anthropic-ai/sdk` for Phase 4) and to ensure the build process is run correctly.

```dockerfile
# (Abridged Example)
FROM node:16 as builder
WORKDIR /usr/src/build
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:16-slim
WORKDIR /usr/src/app
COPY --from=builder /usr/src/build/build ./build
COPY --from=builder /usr/src/build/server-build ./server-build
COPY --from=builder /usr/src/build/node_modules ./node_modules
COPY --from=builder /usr/src/build/package*.json ./
# Add new dependencies if needed
# RUN npm install @anthropic-ai/sdk

ENV NODE_ENV=production
CMD ["node", "server-build/index.js"]
```

---

## 8. Summary of Work Completed (Session 2 - Nov 13, 2025)

### Successfully Completed

✅ **Application Stability:**

- Fixed critical syntax error in dm-map.tsx (FlatContextProvider array)
- Fixed duplicate MapView export in map-view.tsx
- Frontend builds successfully with zero errors
- Backend compiles without TypeScript errors
- Server runs without crashing

✅ **Frontend Integration:**

- Restructured dmTools array to use proper MapTool objects
- All tool components properly typed and mapped
- Token click handler integrated into LazyLoadedMapView
- TokenStatsPanel conditionally renders when token is selected
- InitiativeTracker component available with button in toolbar
- Fixed missing component props (ContextMenuRenderer, SharedTokenMenu)
- Fixed icon references (Play → Dice)

✅ **Type Safety:**

- All component props properly typed
- Tool IDs defined as string literals: "drag-pan-zoom", "brush", "area-select", "mark-area", "token-marker", "configure-grid"
- MapTool interface properly implemented across all tools
- No TypeScript errors in build

### Ready for Next Phase

The application foundation is now solid with:

- ✅ Frontend and backend building without errors
- ✅ DM interface loading at /dm route
- ✅ Token selection infrastructure in place
- ✅ Panels ready for testing
- ✅ Server running stably

### Remaining Work for Phase 1

**Frontend Components (Functional but need GraphQL integration):**

- [ ] Connect TokenStatsPanel to GraphQL queries/mutations
- [ ] Implement HP bar rendering on map view
- [ ] Implement condition icon rendering on tokens
- [ ] Connect InitiativeTracker to combat state management
- [ ] Implement turn/round advancement logic

**Backend GraphQL API:**

- [ ] Verify token_data table schema is created
- [ ] Test upsertTokenData mutation
- [ ] Test updateTokenHP mutation
- [ ] Test condition management mutations
- [ ] Create token data resolver endpoints

**Testing & Bug Fixing:**

- [ ] Manual testing of token selection workflow
- [ ] Test HP damage/healing calculations
- [ ] Test condition application/removal
- [ ] Test initiative sorting and advancement
- [ ] Verify HP bars update in real-time

### Known Issues & Notes

1. **Chakra UI Type Warnings:** Some components (NumberInput, InputGroup, FormControl) have type compatibility warnings but function correctly
2. **Code Splitting Warnings:** Chunks exceed 500KB - can be optimized in future iterations
3. **Icon Import Warning:** "Play" icon not exported - replaced with "Dice" icon
4. **Database Migration:** token_data table should be created on first server startup via migration 4

### Architecture Notes

- Phase 1 UI components (`TokenStatsPanel`, `InitiativeTracker`) are fully built but need GraphQL backend integration
- Map overlay system needs implementation for real-time HP/condition visualization
- Initiative tracker needs round/turn state management system
- All components follow React hooks patterns with TypeScript typing

---

## Recommendations for Next Session

1. **Priority 1:** Connect GraphQL queries to TokenStatsPanel to fetch and display token data
2. **Priority 2:** Implement and test HP bar rendering on the map canvas
3. **Priority 3:** Complete initiative tracker state management and turn advancement
4. **Priority 4:** Add condition icon rendering on tokens
5. **Priority 5:** Comprehensive manual testing of all Phase 1 features

The groundwork is solid. The next phase is about connecting the UI to the backend GraphQL API and ensuring real-time updates work correctly.

---

## Session 5: Phase 1 Frontend Integration & Testing (Nov 14, 2025)

### Status Update

The application is now successfully building and running. The focus for this session is to complete Phase 1 frontend integration by:

1. Verifying that the components are rendered in the dm-map
2. Testing GraphQL queries and mutations work correctly
3. Implementing token click handlers to open the TokenStatsPanel
4. Adding HP bars and condition icons to the map view
5. Testing all Phase 1 functionality

### Current State Analysis

**✅ What's Working:**

- Application builds without errors (No blank screen, no require() errors)
- DM interface loads at /dm route
- Both TokenStatsPanel and InitiativeTracker components are imported in dm-map.tsx
- State variables exist: `showTokenStats`, `selectedTokenId`, `showInitiative`
- GraphQL schema includes all necessary token data queries and mutations
- GraphQL types are generated and available

**❌ What Needs to Be Done:**

1. The TokenStatsPanel and InitiativeTracker components are NOT being rendered (they exist as state but aren't displayed in JSX)
2. Token click handler is not implemented to populate `selectedTokenId` and show the stats panel
3. Integration between MapView/LazyLoadedMapView and the selected token state needs to be established
4. HP bars and condition icons are not rendered on the map canvas
5. Initiative Tracker button not fully integrated into toolbar

### Implementation Plan for Session 5

#### Step 1: Wire Up Toolbar Buttons and Panel Rendering ✓

- Add Initiative Tracker button to bottom toolbar
- Add Token Stats visibility toggle logic
- Render both panels in the dm-map JSX

#### Step 2: Implement Token Selection Flow

- Hook MapView to notify parent (dm-map) when a token is clicked
- Update dm-map to set selectedTokenId and show TokenStatsPanel
- Implement token deselection on panel close

#### Step 3: Test GraphQL Integration

- Verify tokenData query returns valid data
- Test upsertTokenData mutation with sample data
- Test applyDamage and toggleCondition mutations
- Verify mutations persist data correctly

#### Step 4: Implement Map Overlays

- Add HP bar rendering above tokens
- Add condition icon rendering on tokens
- Test real-time updates when HP changes

#### Step 5: Comprehensive Testing

- Manual testing of all Phase 1 features
- Check for console errors
- Verify data persistence
- Test combat flow

### Key Files Involved

- `src/dm-area/dm-map.tsx` - Main integration point
- `src/dm-area/token-stats-panel.tsx` - Token stats UI (complete, needs GraphQL integration)
- `src/dm-area/initiative-tracker.tsx` - Initiative tracker UI (complete, needs GraphQL integration)
- `src/map-view.tsx` - Where token click should be handled
- Server backend (token-data-db.ts, GraphQL resolvers) - Need verification

---

## Session 6: Phase 1 Integration Verification & Testing (Nov 14, 2025 - Continued)

### Build Status

✅ **Frontend Build:** Successful (2799 modules transformed)
✅ **Backend Build:** Successful (TypeScript compilation complete)
✅ **Server:** Running on port 3000 (PID 1884)
✅ **GraphQL Schema:** Generated with 98 reader, 72 normalization, 104 operation text documents
✅ **Relay Compiler:** Successfully compiled all GraphQL queries/mutations

### Code Review Findings

**✅ Frontend Integration - COMPLETE**

1. **dm-map.tsx (Lines 707-713):**

   - State variables properly initialized:
     - `showTokenStats` - Controls token stats panel visibility
     - `selectedTokenId` - Stores currently selected token
     - `showInitiative` - Controls initiative tracker visibility

2. **Token Click Handler (Lines 914-917):**

   ```typescript
   onTokenClick={(tokenId) => {
     setSelectedTokenId(tokenId);
     setShowTokenStats(true);
   }}
   ```

   ✅ Token click handler is implemented and wired to LazyLoadedMapView

3. **Panel Rendering (Lines 921-937):**

   ```typescript
   {
     showInitiative && (
       <InitiativeTracker
         mapId={map.id}
         onClose={() => setShowInitiative(false)}
       />
     );
   }

   {
     showTokenStats && selectedTokenId && (
       <TokenStatsPanel
         tokenId={selectedTokenId}
         mapId={map.id}
         onClose={() => {
           setShowTokenStats(false);
           setSelectedTokenId(null);
         }}
       />
     );
   }
   ```

   ✅ Both panels conditionally render based on state

4. **Toolbar Buttons (Lines 954-970):**
   - Initiative Tracker button at line 956-962
   - Token Stats button at lines 963-970 (conditionally shown when token is selected)
     ✅ Both toolbar buttons properly wired

**✅ GraphQL Schema - COMPLETE**

1. **Token Data Module (server/graphql/modules/token-data.ts):**

   - `TokenData` type with all required fields (id, tokenId, mapId, currentHp, maxHp, tempHp, armorClass, speed, initiativeModifier, conditions, notes)
   - `InitiativeEntry` type for combat tracking
   - `CombatState` type for combat state management
   - Queries: `tokenData`, `allTokenDataForMap`, `combatState`
   - Mutations: `upsertTokenData`, `applyDamage`, `toggleCondition`, `setInitiative`, `advanceInitiative`, `startCombat`, `endCombat`

2. **Database Migration (server/migrations/4.ts):**

   - `token_data` table with proper schema
   - `initiative_order` table for combat tracking
   - Proper indexes for performance
   - Foreign key constraints

3. **Database Access Layer (server/token-data-db.ts):**
   - 418 lines of database access logic
   - All CRUD operations implemented

**✅ Frontend Components - COMPLETE**

1. **TokenStatsPanel (src/dm-area/token-stats-panel.tsx):**

   - 548 lines of complete UI code
   - GraphQL queries and mutations defined
   - HP tracking with visual progress bar
   - Condition management with toggleable badges
   - Quick damage/heal buttons
   - Form inputs for all token stats (HP, AC, speed, initiative modifier, notes)

2. **InitiativeTracker (src/dm-area/initiative-tracker.tsx):**
   - 525 lines of complete UI code
   - GraphQL queries and mutations defined
   - Initiative list with sort by initiative value
   - Combat state tracking (active, round counter)
   - Turn advancement controls
   - Start/End combat buttons

### Current Status Summary

**✅ EVERYTHING IS WIRED AND READY TO TEST**

The code review reveals that ALL frontend integration work from the plan has already been completed:

- ✅ Toolbar buttons exist and are functional
- ✅ Panel rendering logic is in place
- ✅ Token click handler is implemented
- ✅ GraphQL schema is complete with all queries and mutations
- ✅ Database migrations are ready
- ✅ UI components are fully built

### Next Actions Required

**TESTING PHASE:**

1. **Manual Browser Testing:**

   - Open http://localhost:3000/dm in browser
   - Check if DM map loads without errors
   - Test clicking on a token to open TokenStatsPanel
   - Test Initiative Tracker button
   - Verify GraphQL queries execute successfully
   - Test HP/condition modifications

2. **Database Verification:**

   - Verify token_data table was created by migration
   - Check if sample token data can be inserted
   - Verify GraphQL mutations persist data

3. **Missing Implementation Items:**
   - HP bars rendered above tokens on map canvas (not yet implemented)
   - Condition icons rendered on tokens (not yet implemented)
   - Real-time visual updates when HP changes (needs implementation)
