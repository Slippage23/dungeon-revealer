# Quick Reference: Common Tasks for AI Coding Agents

Fast lookup for the most common development tasks in Dungeon Revealer.

## Adding a GraphQL Field

**File**: `server/graphql/modules/{feature}.ts`

```typescript
// 1. Add query field
export const queryFields = [
  t.field({
    name: "myResource",
    type: t.NonNull(GraphQLMyResourceType),
    args: { id: t.arg(t.NonNullInput(t.String)) },
    resolve: (_, args, context) => RT.run(getMyResource(args.id), context),
  }),
];

// 2. Register in server/graphql/index.ts
const queryType = t.queryType({
  fields: () => [
    ...notesFields.queryFields,
    ...mapsFields.queryFields,
    ...myResourceFields.queryFields, // Add here
  ],
});
```

**Pattern**: Always use `RT.run(operation, context)` to thread dependencies through resolvers.

## Creating a Relay Mutation

**File**: `src/{feature}/{action}-mutation.ts`

```typescript
import graphql from "babel-plugin-relay/macro";
import { useMutation } from "relay-hooks";

const MyResourceCreateMutation = graphql`
  mutation myResourceCreateMutation($input: MyResourceCreateInput!) {
    myResourceCreate(input: $input) {
      ... on MyResourceCreateSuccess {
        __typename
        resource {
          id
          title
        }
      }
      ... on MyResourceCreateError {
        __typename
        reason
      }
    }
  }
`;

export const useMyResourceCreate = () => {
  const [mutate] = useMutation(MyResourceCreateMutation);

  return (title: string) => {
    mutate({
      variables: { input: { title } },
      onCompleted: (data) => {
        if (data.myResourceCreate.__typename === "MyResourceCreateSuccess") {
          console.log("Created:", data.myResourceCreate.resource);
        }
      },
    });
  };
};
```

**Pattern**: Use discriminated unions for error handling; check `__typename`.

## Creating a Database Migration

**File**: `server/migrations/{nextNumber}.ts`

```typescript
export const migrate = ({ db, dataPath }) => {
  db.exec(`
    CREATE TABLE my_table (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
    
    CREATE INDEX idx_my_table_created_at 
      ON my_table(created_at DESC);
  `);
};
```

**Then**: Add to migration chain in `server/database.ts` and restart server.

## Updating Map Display

**File**: `src/map-view.tsx`

```typescript
// 1. Update canvas content
const context = mapCanvas.getContext("2d")!;
context.clearRect(0, 0, mapCanvas.width, mapCanvas.height);

// Draw grid
drawGrid(context, mapWidth, mapHeight, gridSize, {
  lineColor: "#ccc",
  lineWidth: 1,
  opacity: 0.5,
});

// 2. Mark texture for re-render (CRITICAL!)
mapTexture.needsUpdate = true;
```

**Remember**: Must set `needsUpdate = true` for Three.js to re-render the canvas texture.

## Handling Real-time Updates

**File**: `src/{feature}/{component}.tsx`

```typescript
const MyQuery = graphql`
  query myComponent_MyQuery($id: ID!) @live {
    myResource(id: $id) {
      id
      ...myFragment
    }
  }
`;

const MyComponent = ({ id }) => {
  const { data } = useQuery(MyQuery, { id });

  // Automatically re-renders when server calls:
  // context.liveQueryStore.invalidate(["Query.myResource"])
};
```

**Pattern**: Add `@live` directive to query for automatic re-fetching on server invalidation.

## Testing Database Layer

**File**: `server/feature.spec.ts`

```typescript
import Database from "better-sqlite3";
import * as E from "fp-ts/lib/Either";

describe("getNoteById", () => {
  let db: Database.Database;

  beforeAll(() => {
    db = new Database(":memory:"); // In-memory test DB
    // Run migrations...
  });

  it("returns note when found", () => {
    // Setup
    db.prepare(
      "INSERT INTO notes (id, title, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?)"
    ).run("note-1", "Test", "Content", 123, 123);

    // Execute
    const result = decodeNote({
      id: "note-1",
      title: "Test",
      content: "Content",
      created_at: 123,
      updated_at: 123,
    });

    // Assert
    expect(E.isRight(result)).toBe(true);
  });
});
```

**Pattern**: Use in-memory DB (`:memory:`) for tests; assert with `E.isRight()`.

## Checking Role Authorization

**File**: `server/graphql/modules/feature.ts`

```typescript
export const mutationFields = [
  t.field({
    name: "dmOnlyOperation",
    type: t.NonNull(GraphQLResult),
    resolve: (_, args, context) =>
      RT.run(
        pipe(
          requireAdmin(context), // Checks session.role === "admin"
          RT.chainW(() => myOperation(args))
        ),
        context
      ),
  }),
];
```

**Or check manually**:

```typescript
if (context.session.role !== "admin") {
  return {
    __typename: "OperationError",
    reason: "DM only",
  };
}
```

## Broadcasting Changes to Clients

**File**: `server/graphql/modules/feature.ts`

```typescript
export const mutationFields = [
  t.field({
    name: "updateSomething",
    type: GraphQLResult,
    resolve: (_, args, context) =>
      RT.run(
        pipe(
          performUpdate(args),
          RT.chainW((result) => {
            // Notify all connected clients
            context.liveQueryStore.invalidate([
              "Query.something",
              "Query.somethingList",
            ]);
            return RT.of(result);
          })
        ),
        context
      ),
  }),
];
```

**Pattern**: Call `context.liveQueryStore.invalidate()` after mutations.

## Using fp-ts Either for Error Handling

```typescript
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";

// Check if operation succeeded
if (E.isRight(result)) {
  const value = result.right;
} else {
  const error = result.left;
}

// Map over either
const doubled = pipe(
  parseNumber("42"),
  E.map((n) => n * 2)
);

// Handle both branches
const message = pipe(
  parseNumber("invalid"),
  E.fold(
    (err) => `Error: ${err.message}`,
    (n) => `Number: ${n}`
  )
);
```

## Using fp-ts ReaderTask for Dependency Injection

```typescript
import * as RT from "fp-ts/lib/ReaderTask";
import { pipe } from "fp-ts/lib/function";

// Operation needs a "context" with db and session
const getNote =
  (id: string): RT.ReaderTask<Context, Note> =>
  (context) =>
    // Now you have context.db, context.session, etc.
    Promise.resolve(context.db.getNoteById(id));

// Chain operations
const createAndFetch = pipe(
  createNote(input),
  RT.chain((created) => getNote(created.id))
);

// Run with context
RT.run(createAndFetch, { db, session })();
```

## Drawing on Canvas

```typescript
import { drawCircle, drawTextWithBackground } from "src/canvas-draw-utilities";

const context = mapCanvas.getContext("2d")!;

// Draw token
drawCircle(context, x, y, radius, {
  fillColor: "#ff0000",
  strokeColor: "#000",
  lineWidth: 2,
});

// Draw label
drawTextWithBackground(context, "Token Name", x, y, {
  fontSize: 12,
  fontFamily: "Arial",
  textColor: "#fff",
  backgroundColor: "#000",
  padding: 4,
  borderRadius: 2,
});

// Mark texture for update
mapTexture.needsUpdate = true;
```

## Converting Coordinates

```typescript
import { coordinates } from "src/map-tools/map-tool";

// Image (0,0 = top-left) → Canvas (0,0 = top-left)
const canvasCoords = coordinates.imageToCanvas(imageVector);

// Canvas → Three.js (0,0 = center)
const threeCoords = coordinates.canvasToThree(canvasCoords);

// Three.js → Canvas → Image (reverse)
const imageCoords = coordinates.canvasToImage(
  coordinates.threeToCanvas(threeCoords)
);
```

## Raycasting for Mouse Interaction

```typescript
const screenToImage = ([x, y]: Vector2D): Vector2D => {
  const { raycaster, camera } = useThree();

  // Convert screen space to normalized device coords (-1 to +1)
  const vector = new THREE.Vector2(
    (x / size.width) * 2 - 1,
    -(y / size.height) * 2 + 1
  );

  raycaster.setFromCamera(vector, camera);
  const intersections = raycaster.intersectObject(planeRef.current);

  if (intersections.length === 0) return [0, 0];

  const point = intersections[0].point;
  return coordinates.canvasToImage(
    coordinates.threeToCanvas({
      x: point.x,
      y: point.y,
      z: point.z,
    })
  );
};
```

## Subscribing to Real-time Events

```typescript
const MySubscription = graphql`
  subscription myComponent_MySubscription {
    eventUpdated {
      id
      data
    }
  }
`;

const MyComponent = () => {
  useSubscription(
    React.useMemo(
      () => ({
        subscription: MySubscription,
        onNext: (data) => {
          console.log("Event:", data.eventUpdated);
        },
      }),
      []
    )
  );
};
```

## Common File Paths

| Purpose             | Path                                  |
| ------------------- | ------------------------------------- |
| GraphQL modules     | `server/graphql/modules/{feature}.ts` |
| Database queries    | `server/{feature}-db.ts`              |
| Business logic      | `server/{feature}-lib.ts`             |
| Frontend components | `src/{feature}/{component}.tsx`       |
| Mutations           | `src/{feature}/{action}-mutation.ts`  |
| Queries             | `src/{feature}/{query}-query.ts`      |
| Migrations          | `server/migrations/{number}.ts`       |
| Type decoders       | `server/io-types/{type}.ts`           |
| Tests               | `**/*.spec.ts`                        |
| Map rendering       | `src/map-view.tsx`                    |
| Three.js utilities  | `src/map-tools/`                      |

## Environment Variables

```bash
# .env file

# Authentication
DM_PASSWORD=your_dm_password
PC_PASSWORD=your_pc_password

# Server
PORT=3000
SOCKET_IO_PATH=/api/socket.io

# File storage
DATA_PATH=./data

# Development
NODE_ENV=development
```

## Build & Run Commands

```bash
# Development
npm run start:frontend:dev    # Vite on :4000 (proxies to :3000)
npm run start:server:dev      # ts-node-dev watching server/

# Building
npm run build                 # Frontend + backend
npm run relay-compiler        # Regenerate Relay queries

# Testing
npm test                       # Jest

# Production
npm run start:frontend        # Serve built frontend
npm run start:server          # Run compiled backend
```

## Debugging Checklist

- **Relay mutations not firing**: Check `@live` directive, verify Socket.IO auth, inspect Network tab
- **Canvas not updating**: Did you set `texture.needsUpdate = true`?
- **Database queries return `undefined`**: Apply io-ts decoder, check row exists
- **Authorization failures**: Verify `context.session.role`, check password env vars
- **Type errors in fp-ts**: Use `E.fold()` to handle both branches of Either
- **Token budget exceeded**: Break large AI requests into smaller, focused tasks
