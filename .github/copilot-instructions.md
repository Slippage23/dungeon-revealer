# Dungeon Revealer - AI Coding Agent Instructions

## Project Overview

Dungeon Revealer is a real-time, self-hosted web app for tabletop gaming (D&D, Cyberpunk, etc.). It features:

- **DM Area**: Complete map control with fog-of-war, tokens, and player management
- **Player Area**: Real-time map viewing, token movement (optionally), and interactive elements
- **GraphQL API**: Live queries, subscriptions, and mutations via Socket.IO WebSocket
- **Relay Integration**: Frontend uses Meta Relay for efficient client-side caching and normalized queries

## Architecture

### Frontend (React/TypeScript)

- **Entry Points**: `src/index.tsx` routes to `/dm` (DM area) or `/` (player area)
- **Build Tool**: Vite (dev: port 4000, proxies to backend at :3000)
- **State Management**: Relay GraphQL + React hooks
- **Key Dependencies**: Chakra UI, Emotion CSS, Three.js (3D maps), React Spring
- **Auth Pattern**: Bearer token in Authorization header; roles: "DM" vs "Player"

### Backend (Express + Socket.IO)

- **Entry Point**: `server/index.ts` → `bootstrapServer()` in `server/server.ts`
- **Database**: SQLite with migrations in `server/migrations/`
- **GraphQL Server**: gqtx library via `server/graphql/index.ts`
- **Real-time**: Socket.IO WebSocket + GraphQL Live Queries (`@n1ru4l/graphql-live-query`)
- **Modules**: Notes, Maps, Tokens, Images, Chat/Dice, Users (in `server/graphql/modules/`)

### Key Data Flows

1. **Client Auth**: POST `/auth` with Bearer token → role validation via `DM_PASSWORD`/`PC_PASSWORD` env vars
2. **GraphQL Mutations**: Client commits mutation via Relay → Socket.IO delivers to server → live query invalidation
3. **Subscriptions**: `chatMessagesAdded`, `userUpdate` stream updates to connected clients
4. **Asset Storage**: Maps/tokens uploaded to `data/` directory; managed by `FileStorage` class

## Critical Conventions

### Functional Programming (fp-ts)

- **Use `ReaderTask<Context, Value>`** for dependency injection (session, db, context)
- **Use `ReaderTaskEither<Context, Error, Value>`** for computations that may fail
- **Pattern**: `pipe(operation1, RT.chain(operation2), RT.run(context))`
- **Never use promises directly in resolvers** — use RT/RTE to maintain context threading
- **Example**: `server/notes-db.ts` shows cursor-based pagination with fp-ts chains

### Type Safety with io-ts

- **Decode untrusted data** (db results, user input) with `io-ts` types
- **Apply decoders in db layer**: `decodeNote()`, `decodeNoteList()` before returning
- **Custom types for domain conversions**: `BooleanFromNumber`, `IntegerFromString` in `server/io-types/`
- **Use `io-ts` union types** for GraphQL error/success result discriminated unions

### GraphQL Schema Organization

- **Module per feature**: `server/graphql/modules/{feature}.ts` exports `queryFields`, `mutationFields`, `subscriptionFields`, `subscriptionsFields` (note typo in token-image.ts)
- **All modules registered in `server/graphql/index.ts`** by spreading field arrays into Query/Mutation/Subscription
- **Role-based field resolution**: Check `context.session.role === "admin"` in resolvers (e.g., `maps.ts` line 556)
- **Live Query Invalidation**: After mutation, call `context.liveQueryStore.invalidate(["Query.resourceName"])` to notify subscribers

### Session & Authorization

- **Session object**: `{ id: string; role: "admin" | "user" }` from `socket-session-store.ts`
- **"admin" role** = DM with `DM_PASSWORD`; **"user" role** = player with `PC_PASSWORD`
- **Helpers**: `requireAdmin()` and `requireAuth()` in `server/auth.ts` return RT.ReaderTask for permission checks
- **Frontend**: Roles are "DM" or "Player"; determined at login, stored in context

### Database Patterns

- **Migrations**: Add new schema changes to `server/migrations/{number}.ts`, update version in `database.ts`
- **Cursor-based pagination**: Store `{ lastCreatedAt: number; lastId: string }` in Relay cursor (base64 encoded)
- **Relay Global IDs**: Encode as `base64("01:TypeName:id")` using helpers in `relay-spec/index.ts`
- **camelCase in TS, snake_case in SQL**: Use `camelCaseKeys()` util after db.get() or db.all()

### Test Patterns

- **Jest + babel-jest**: Tests in `**/*.spec.ts` (e.g., `server/notes-lib.spec.ts`)
- **Test structure**: Create session mock with `{ id: "1", role: "user" }`, test lib functions with `RT.run(action, context)()`
- **Assertion style**: Use `E.isRight(result)` to check Either success; extract `.right` for value

## Development Workflow

### Local Setup

```bash
npm install
npm run start:frontend:dev  # Vite on :4000, proxies /api to :3000
npm run start:server:dev    # ts-node-dev watches server/
npm test                     # Jest
```

### Build & Deploy

```bash
npm run build                # Builds frontend (vite) + backend (tsc)
npm run compile:win          # Creates Windows exe with caxa bundler
```

### GraphQL Schema Updates

1. Modify `type-definitions.graphql` or `server/graphql/modules/{feature}.ts`
2. Run `npm run relay-compiler` to regenerate `__generated__` files
3. Update Relay fragment references in `src/` if query shapes changed

## Common Patterns by Feature

### Adding a New GraphQL Field

1. Add to `server/graphql/modules/{feature}.ts` in appropriate `queryFields`, `mutationFields`, etc.
2. Use `t.field()` (gqtx builder) with `type`, `args`, `resolve` callback
3. In resolve, access `context` (has session, db, chat, liveQueryStore)
4. Return `RT.run(action, context)` if using fp-ts
5. Register module in `server/graphql/index.ts` by spreading field arrays

### Live Query Invalidation

After a mutation updates data:

```typescript
context.liveQueryStore.invalidate(["Query.notes", "Query.map"]);
```

This notifies all connected clients subscribed to those queries.

### Frontend Component Authentication

Check role in component with `useViewerRole()` hook or render context.
Example: `src/dm-area/dm-area.tsx` checks DM auth before rendering controls.

### Adding a Database Migration

1. Create `server/migrations/{nextNumber}.ts` with `export const migrate = ({ db, dataPath }) => { ... }`
2. Add to migration chain in `database.ts`
3. Increment user_version pragma (auto-runs on startup)

## Relay Integration Patterns (Frontend Mutations)

### Basic Mutation Hook Pattern

Use `useMutation` hook from `relay-hooks` with `graphql` macro for type-safe mutations:

```tsx
import graphql from "babel-plugin-relay/macro";
import { useMutation } from "relay-hooks";

const NoteCreateMutation = graphql`
  mutation noteCreateMutation($input: NoteCreateInput!) {
    noteCreate(input: $input) {
      note {
        id
        title
        content
      }
    }
  }
`;

export const useNoteCreate = () => {
  const [mutate] = useMutation<noteCreateMutation>(NoteCreateMutation);
  return (title: string, content: string) => {
    mutate({
      variables: { input: { title, content, isEntryPoint: false } },
      onCompleted: (data) => console.log("Note created:", data.noteCreate.note),
      onError: (err) => console.error("Create failed:", err),
    });
  };
};
```

### Discriminated Union Results

GraphQL errors are modeled as discriminated unions; handle both success/failure branches:

```tsx
const MapCreateMutation = graphql`
  mutation mapCreateMutation($input: MapCreateInput!) {
    mapCreate(input: $input) {
      ... on MapCreateSuccess {
        __typename
        createdMap {
          id
          title
        }
      }
      ... on MapCreateError {
        __typename
        reason
      }
    }
  }
`;

const [mutate] = useMutation(MapCreateMutation);
mutate({
  variables: { input: { title: "New Map" } },
  onCompleted: (data) => {
    if (data.mapCreate.__typename === "MapCreateSuccess") {
      console.log("Map:", data.mapCreate.createdMap);
    } else {
      console.error("Error:", data.mapCreate.reason);
    }
  },
});
```

### Connection Updates & Pagination

For list mutations (add/remove items), use Relay's connection handlers:

```tsx
import { ConnectionHandler } from "relay-runtime";

const [mutate] = useMutation(TokenImageCreateMutation);
mutate({
  variables: { input, connections: [tokenImageConnectionId] },
  onCompleted: (data) => {
    if (data.tokenImageCreate.__typename === "TokenImageCreateSuccess") {
      // Relay automatically @prependNode to connection via mutation config
    }
  },
});
```

### Optimistic Updates

Update Relay store immediately before server response (for fast UI):

```tsx
const [mutate] = useMutation(NoteUpdateContentMutation);
mutate({
  variables: { input: { id: noteId, content } },
  optimisticResponse: {
    noteUpdateContent: {
      note: { id: noteId, content, __typename: "Note" },
    },
  },
});
```

### Use `@live` Directive for Real-time Queries

Queries with `@live` directive auto-update when subscriptions fire:

```tsx
const MapQuery = graphql`
  query dmArea_MapQuery($mapId: ID!) @live {
    map(id: $mapId) {
      id
      ...mapFragment
    }
  }
`;

// Query automatically re-fetches when server calls `liveQueryStore.invalidate(["Query.map"])`
```

## Three.js 3D Map Rendering Patterns

### Canvas & Texture Setup

Map rendering uses `react-three-fiber` (R3F) for Three.js canvas integration. Textures are loaded from HTMLCanvas elements:

```tsx
const [mapCanvas] = React.useState(() => {
  const canvas = window.document.createElement("canvas");
  canvas.width = optimalDimensions.width;
  canvas.height = optimalDimensions.height;
  return canvas;
});

const [mapTexture] = React.useState(() => new THREE.CanvasTexture(mapCanvas));

// Update canvas context and mark texture for re-render
const context = mapCanvas.getContext("2d")!;
context.drawImage(mapImage, 0, 0, width, height);
mapTexture.needsUpdate = true;
```

### Rendering Layers with RenderOrder

Layer organization prevents z-fighting; use `renderOrder` enum:

```tsx
enum LayerRenderOrder {
  map = 0, // Base map image
  mapGrid = 1, // Grid overlay
  token = 2, // Token meshes
  tokenText = 4, // HP/names rendered on canvas
  marker = 6, // Fog markers
  outline = 7, // Selection highlights
}

<mesh renderOrder={LayerRenderOrder.token}>
  <circleBufferGeometry attach="geometry" args={[radius, 128]} />
  <meshStandardMaterial attach="material" color={color} />
</mesh>;
```

### Coordinate System Conversion

Three.js uses centered coordinates; images use top-left origin. Helper functions bridge them:

```tsx
// Image coords (0,0 = top-left) → Three.js coords (0,0 = center)
const calculateX = (x: number, factor: number, width: number) =>
  x * factor - width / 2;
const calculateY = (y: number, factor: number, height: number) =>
  -y * factor + height / 2;

// Three.js → Image coords (reverse)
const calculateRealX = (x: number, factor: number, width: number) =>
  (x + width / 2) / factor;
const calculateRealY = (y: number, factor: number, height: number) =>
  ((y - height / 2) / factor) * -1;

// Use in helper utilities (src/map-tools/map-tool.tsx)
imageCoordinatesToThreePoint: (vector) =>
  coordinates.canvasToThree(coordinates.imageToCanvas(vector));
```

### Fog & Grid Rendering

Fog-of-war is a textured plane layered over the map; grid is drawn to canvas once:

```tsx
<mesh renderOrder={LayerRenderOrder.mapGrid}>
  <planeBufferGeometry attach="geometry" args={[width, height]} />
  <meshStandardMaterial attach="material" map={gridTexture} transparent />
</mesh>

<mesh renderOrder={LayerRenderOrder.overlay}>
  <planeBufferGeometry attach="geometry" args={[width, height]} />
  <meshBasicMaterial attach="material" map={fogTexture} transparent opacity={0.5} />
</mesh>
```

### Animated Tokens with React Spring

Tokens animate position/scale via `@react-spring/three`:

```tsx
const spring = useSpring({
  position: [x, y, 0] as [number, number, number],
  scale: [radius, radius, radius],
  config: { duration: 200 },
});

<animated.mesh position={spring.position} scale={spring.scale}>
  <circleBufferGeometry attach="geometry" args={[1, 128]} />
  <meshStandardMaterial attach="material" color={color} />
</animated.mesh>;
```

### Raycasting for Interaction

Raycaster converts mouse coordinates to 3D space for token selection/dragging:

```tsx
const { raycaster, camera, scene } = useThree();

const screenToImage = ([x, y]: Vector2D): Vector2D => {
  const vector = new THREE.Vector2(
    (x / size.width) * 2 - 1,
    -(y / size.height) * 2 + 1
  );
  raycaster.setFromCamera(vector, camera);
  const [intersection] = raycaster.intersectObject(planeRef.current);
  return intersection ? coordinates.canvasToImage(intersection.point) : [0, 0];
};
```

### Context Bridge for React Contexts in R3F

Pass React contexts into Three.js/R3F subtree (required for Relay + Socket.IO contexts):

```tsx
const ContextBridge = useContextBridge(
  FetchContext,
  RelayEnvironmentContext,
  ChatPositionContext
);

<Canvas>
  <ContextBridge>
    <MapRenderer />
  </ContextBridge>
</Canvas>;
```

## fp-ts Error Handling Examples

### Either Type for Fallible Operations

`Either<Error, Value>` represents success or failure; use `E.isRight()` to check:

```typescript
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";

// Decoding untrusted data
const result: E.Either<Error, User> = UserModel.decode(dbRow);

if (E.isRight(result)) {
  const user = result.right;
  console.log("User:", user);
} else {
  console.error("Decode failed:", result.left);
}
```

### ReaderTaskEither for Context-Dependent Operations

`RTE<Context, Error, Value>` chains operations that need context (db, session):

```typescript
import * as RTE from "fp-ts/lib/ReaderTaskEither";
import * as RT from "fp-ts/lib/ReaderTask";

export const getNoteById =
  (
    id: string
  ): RTE.ReaderTaskEither<Dependencies, DecodeError, NoteModelType> =>
  ({ db }) =>
    pipe(
      TE.tryCatch(
        () => db.get("SELECT * FROM notes WHERE id = ?", id),
        E.toError
      ),
      TE.chainW(flow(decodeNote, TE.fromEither))
    );

// Run with context: RT.run(getNoteById("123"), { db, session })()
```

### Fold for Conditional Logic

Use `E.fold()` to handle both branches of an Either:

```typescript
const result = UserModel.decode(input);

const message = E.fold(
  (error) => `Validation failed: ${error.message}`,
  (user) => `Welcome, ${user.name}!`
)(result);

// Or in pipe:
pipe(
  result,
  E.fold(
    (err) => console.error("Error:", err),
    (user) => console.log("User:", user)
  )
);
```

### ChainW for Type-Safe Error Propagation

Use `chainW` (chain with wider error type) to combine operations:

```typescript
pipe(
  decodeId(input),
  E.chainW(([, type, id]) =>
    type === "Note" ? E.right(id) : E.left(new Error(`Invalid type '${type}'`))
  ),
  E.map((id) => parseNote(id))
);
```

### Sequence Operations with Apply

Use `sequenceT` or `sequenceS` to combine multiple Eithers:

```typescript
import { sequenceS } from "fp-ts/lib/Apply";

const result = sequenceS(E.either)({
  id: decodeId(input.id),
  title: E.right(input.title),
  isActive: BooleanFromNumber.decode(input.isActive),
});

// result: Either<Error, { id: string; title: string; isActive: boolean }>
```

### TaskEither for Async Operations

`TE<Error, Value>` handles async fallible operations (promises):

```typescript
import * as TE from "fp-ts/lib/TaskEither";

const loadUser = (id: string): TE.TaskEither<Error, User> =>
  TE.tryCatch(() => fetch(`/api/users/${id}`).then((r) => r.json()), E.toError);

// Chain multiple async ops
pipe(
  loadUser("123"),
  TE.chain((user) => validateUser(user)),
  TE.fold(
    (err) => () => console.error(err),
    (user) => () => console.log(user)
  )
)();
```

### Custom Decoders with io-ts

Define type-safe decoders for domain conversions:

```typescript
// server/io-types/boolean-from-number.ts
export const BooleanFromNumber = new t.Type(
  "BooleanFromNumber",
  t.boolean.is,
  (input, context) =>
    pipe(
      t.number.validate(input, context),
      E.chain((value) => t.success(Boolean(value)))
    ),
  (value) => (value ? 1 : 0)
);

// Usage in db layer
const result = pipe(
  dbRow,
  (row) => ({ ...camelCaseKeys(row) }),
  (obj) => NoteModel.decode(obj)
);
```

## Critical Files Reference

- **Backend entry**: `server/server.ts`, `server/index.ts`
- **GraphQL schema builder**: `server/graphql/index.ts`
- **Database layer**: `server/notes-db.ts` (exemplary db patterns)
- **Frontend entry**: `src/index.tsx`, auth in `src/authentication-screen.tsx`
- **Relay setup**: `src/relay-environment.ts`, queries use `graphql` macro from `babel-plugin-relay/macro`
- **Role system**: `server/auth.ts`, `server/socket-session-store.ts`
- **3D Map rendering**: `src/map-view.tsx` (canvas, textures, layers, raycasting)
- **Map tools**: `src/map-tools/` (pan/zoom, brush, area select, grid configuration)
- **Token rendering**: `src/map-view.tsx` TokenRenderer components (animations, selection, icons)

## Debugging Tips

- **Backend logs**: Check console output from `npm run start:server:dev`
- **GraphQL errors**: Inspect Socket.IO messages in browser DevTools Network tab
- **Type errors**: `fp-ts` type narrowing requires `E.isLeft()` or pattern matching; use `E.fold()` for both cases
- **Relay cache issues**: Use `React.Suspense` boundary; query `@live` directive for real-time updates
- **Auth failures**: Verify `DM_PASSWORD` env var matches frontend Bearer token
- **Three.js rendering**: Check `LayerRenderOrder` enum to debug z-fighting; use `renderOrder` consistently
- **Vite build issues**: Ensure Babel plugins aren't included in browser bundle; they run pre-build via `relay-compiler`

## Current Project Status (Nov 14, 2025)

**Build Status**: ✅ **ALL SYSTEMS OPERATIONAL**

- Frontend: Builds successfully with Vite (2799 modules)
- Backend: TypeScript compiles cleanly
- Application displays DM map with no console errors
- Relay compiler generates types correctly

**Phase 1: Advanced Token Management**

- **Backend**: ✅ COMPLETE — GraphQL mutations for HP tracking, conditions, initiative tracker
- **Frontend Integration**: 🚧 IN PROGRESS
  - Token stats panel component created (needs GraphQL wiring)
  - Initiative tracker component created (needs GraphQL mutations)
  - HP bar rendering layer added to `map-view.tsx`
  - Condition icon rendering prepared
- **Next Steps**: Wire up GraphQL queries/mutations in components, test HP/condition updates

**Build Tool Resolution**: ✅ FIXED (Session 4)

- Root cause: Babel plugins were being bundled into browser code
- Solution: Disabled Babel in Vite React plugin (Vite handles JSX natively)
- Result: No more `require is not defined` errors

**Key Learning**: Babel plugins are build-time tools. They run via `npm run relay-compiler` before Vite bundling. The browser only receives compiled output, never the transformation tools.

## Enhancement Roadmap Context

See `CONSOLIDATED_ENHANCEMENT_PLAN.md` for full details. Quick summary:

| Phase | Feature                   | Status                  | Time      |
| ----- | ------------------------- | ----------------------- | --------- |
| 1     | Advanced Token Management | Backend ✅, Frontend 🚧 | 2-3 weeks |
| 2     | Enhanced Note System      | Not Started             | 3-4 weeks |
| 3     | Automation & Macros       | Not Started             | 2-3 weeks |
| 4     | AI Assistant (Optional)   | Not Started             | 1-2 weeks |

**Phase 1 Focus Areas for Next Session**:

1. GraphQL query wiring in TokenStatsPanel for real-time token data
2. Implement HP bar rendering on canvas with color gradients
3. Add condition icon rendering next to token labels
4. Test initiative tracker mutations (start/advance combat)
5. Wire up damage/healing quick buttons to backend mutations
