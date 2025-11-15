# Database Patterns & Schema Migrations

## Database Architecture

Dungeon Revealer uses SQLite3 with a migration system. The database layer strictly separates concerns: SQL queries, type decoding, and business logic.

### Database File Location

```
data/
  db.sqlite
  uploads/
```

## Database Initialization (server/database.ts)

### 1. Database Connection Setup

```typescript
import Database from "better-sqlite3";

let db: Database.Database | null = null;

export const getDatabaseInstance = (dataPath: string): Database.Database => {
  if (db) return db;

  db = new Database(path.join(dataPath, "db.sqlite"));
  db.pragma("journal_mode = WAL"); // Write-Ahead Logging for concurrency
  db.pragma("foreign_keys = ON"); // Enable foreign key constraints

  return db;
};

export const closeDatabase = (): void => {
  if (db) {
    db.close();
    db = null;
  }
};
```

### 2. Migration System

Migrations are sequential files that run once on startup:

```typescript
// server/migrations/1.ts
export const migrate = ({ db, dataPath }: MigrationContext) => {
  db.exec(`
    CREATE TABLE notes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    
    CREATE TABLE maps (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);
};
```

```typescript
// server/migrations/2.ts
export const migrate = ({ db, dataPath }: MigrationContext) => {
  db.exec(`
    ALTER TABLE notes ADD COLUMN is_entry_point BOOLEAN DEFAULT 0;
  `);
};
```

### 3. Migration Runner (server/database.ts)

```typescript
export const runMigrations = (db: Database.Database): void => {
  // Get current schema version
  const version = db.pragma("user_version", { simple: true }) as number;

  // Load all migrations
  const migrations = [
    require("./migrations/1"),
    require("./migrations/2"),
    require("./migrations/3"),
    // ...
  ];

  // Run only new migrations
  for (let i = version; i < migrations.length; i++) {
    console.log(`Running migration ${i + 1}...`);

    db.exec("BEGIN TRANSACTION");
    try {
      migrations[i].migrate({ db, dataPath });
      db.pragma(`user_version = ${i + 1}`);
      db.exec("COMMIT");
    } catch (err) {
      db.exec("ROLLBACK");
      throw err;
    }
  }
};

// Call on startup
const db = getDatabaseInstance(dataPath);
runMigrations(db);
```

## Query Layer Pattern (server/notes-db.ts)

The database layer returns **untyped** query results that must be decoded.

### 1. Raw Query Functions

```typescript
// server/notes-db.ts
export const getNoteById = (db: Database.Database, id: string) => {
  return db.prepare("SELECT * FROM notes WHERE id = ? LIMIT 1").get(id);
};

export const getNotesByParent = (
  db: Database.Database,
  parentId: string | null,
  limit: number = 50,
  offset: number = 0
) => {
  return db
    .prepare(
      `
      SELECT * FROM notes 
      WHERE parent_id = ? 
      ORDER BY created_at DESC, id DESC 
      LIMIT ? OFFSET ?
      `
    )
    .all(parentId, limit, offset);
};

export const createNote = (
  db: Database.Database,
  input: {
    id: string;
    title: string;
    content: string;
    parentId: string | null;
    isEntryPoint: boolean;
  }
) => {
  const now = Date.now();
  return db
    .prepare(
      `
      INSERT INTO notes 
        (id, title, content, parent_id, is_entry_point, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `
    )
    .run(
      input.id,
      input.title,
      input.content,
      input.parentId,
      input.isEntryPoint ? 1 : 0,
      now,
      now
    );
};
```

### 2. Type Decoding with io-ts

```typescript
// server/io-types/note-model.ts
import * as t from "io-ts";
import { BooleanFromNumber } from "./boolean-from-number";
import { IntegerFromString } from "./integer-from-string";

export const NoteModel = t.exact(
  t.type({
    id: t.string,
    title: t.string,
    content: t.string,
    parentId: t.union([t.string, t.null]),
    isEntryPoint: BooleanFromNumber,
    createdAt: IntegerFromString,
    updatedAt: IntegerFromString,
  })
);

export type NoteModelType = t.TypeOf<typeof NoteModel>;
```

```typescript
// server/io-types/boolean-from-number.ts
import * as t from "io-ts";
import { pipe } from "fp-ts/lib/function";
import * as E from "fp-ts/lib/Either";

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
```

### 3. Applying Decoders in Database Layer

**CRITICAL RULE**: Always decode at the database boundary, never in business logic:

```typescript
// server/notes-db.ts
import * as E from "fp-ts/lib/Either";
import { camelCaseKeys } from "server/util";

export const decodeNote = (row: any): E.Either<DecodeError, NoteModelType> =>
  pipe(row, camelCaseKeys, NoteModel.decode);

export const getNoteById = (
  db: Database.Database,
  id: string
): E.Either<DecodeError, NoteModelType> => {
  const row = db.prepare("SELECT * FROM notes WHERE id = ? LIMIT 1").get(id);

  if (!row) {
    return E.left(new DecodeError(`Note not found: ${id}`));
  }

  return decodeNote(row);
};

export const getNotesByParent = (
  db: Database.Database,
  parentId: string | null
): E.Either<DecodeError, NoteModelType[]> => {
  const rows = db
    .prepare(
      `
      SELECT * FROM notes 
      WHERE parent_id = ?
      ORDER BY created_at DESC
      `
    )
    .all(parentId);

  return pipe(rows, E.traverseArray(decodeNote));
};
```

## Business Logic Layer (server/notes-lib.ts)

Business logic operates on **decoded** types using fp-ts:

### 1. ReaderTaskEither Pattern

```typescript
// server/notes-lib.ts
import * as RTE from "fp-ts/lib/ReaderTaskEither";
import { pipe } from "fp-ts/lib/function";

interface Dependencies {
  db: Database.Database;
  liveQueryStore: LiveQueryStore;
}

export const createNote =
  (
    input: NoteCreateInput
  ): RTE.ReaderTaskEither<Dependencies, Error, NoteModelType> =>
  ({ db, liveQueryStore }) =>
    pipe(
      // Generate ID
      TE.right(generateId()),
      // Insert into database
      TE.chainW((id) =>
        TE.tryCatch(
          () =>
            db
              .prepare(
                `
                INSERT INTO notes 
                  (id, title, content, parent_id, is_entry_point, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                `
              )
              .run(
                id,
                input.title,
                input.content,
                input.parentId,
                input.isEntryPoint ? 1 : 0,
                Date.now(),
                Date.now()
              ),
          E.toError
        )
      ),
      // Fetch created note
      TE.chainW(() => TE.fromEither(getNoteById(db, id))),
      // Invalidate queries
      TE.chainW((note) =>
        pipe(
          TE.right(liveQueryStore.invalidate(["Query.notes", "Query.note"])),
          TE.map(() => note)
        )
      )
    );
```

## Cursor-based Pagination

### 1. Encoding Relay Cursor

```typescript
// server/util.ts
export const encodeRelayEdgeCursor = (
  createdAt: number,
  id: string
): string => {
  return Buffer.from(`01:${createdAt}:${id}`).toString("base64");
};

export const decodeRelayEdgeCursor = (
  cursor: string
): { createdAt: number; id: string } => {
  const decoded = Buffer.from(cursor, "base64").toString("utf-8");
  const [version, createdAt, id] = decoded.split(":");

  if (version !== "01") throw new Error("Invalid cursor version");

  return {
    createdAt: parseInt(createdAt, 10),
    id,
  };
};
```

### 2. Fetching with Cursor

```typescript
// server/notes-db.ts
export const getNotesByParentWithPagination = (
  db: Database.Database,
  parentId: string | null,
  first: number = 10,
  after?: string
): E.Either<
  Error,
  { edges: Array<{ node: NoteModelType; cursor: string }>; pageInfo: PageInfo }
> => {
  let query = `
    SELECT * FROM notes 
    WHERE parent_id = ?
    ORDER BY created_at DESC, id DESC
  `;

  const params: any[] = [parentId];

  if (after) {
    try {
      const { createdAt, id } = decodeRelayEdgeCursor(after);
      query += ` AND (created_at < ? OR (created_at = ? AND id < ?))`;
      params.push(createdAt, createdAt, id);
    } catch {
      return E.left(new Error("Invalid cursor"));
    }
  }

  query += ` LIMIT ?`;
  params.push(first + 1); // Fetch one extra to determine hasNextPage

  const rows = db.prepare(query).all(...params);

  const hasNextPage = rows.length > first;
  const edges = rows.slice(0, first).map((row) => ({
    node: pipe(
      decodeNote(row),
      E.getOrElseW((err) => {
        throw err;
      })
    ),
    cursor: encodeRelayEdgeCursor(row.created_at, row.id),
  }));

  return E.right({
    edges,
    pageInfo: {
      hasNextPage,
      endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
    },
  });
};
```

## GraphQL Resolver Integration

### 1. Chaining Database Operations in Resolvers

```typescript
// server/graphql/modules/notes.ts
import * as RTE from "fp-ts/lib/ReaderTaskEither";
import * as RT from "fp-ts/lib/ReaderTask";

export const queryFields = [
  t.field({
    name: "notes",
    type: t.NonNull(GraphQLNoteConnection),
    args: {
      parentId: t.arg(t.String),
      first: t.arg(t.Int, { defaultValue: 10 }),
      after: t.arg(t.String),
    },
    resolve: (_, args, context: GraphQLContext) =>
      RT.run(
        pipe(
          getNotesByParentWithPagination(
            context.db,
            args.parentId,
            args.first,
            args.after
          ),
          RTE.fold(
            (err) => RT.of({ edges: [], pageInfo: { hasNextPage: false } }),
            (result) => RT.of(result)
          )
        ),
        context
      ),
  }),
];

export const mutationFields = [
  t.field({
    name: "noteCreate",
    type: t.NonNull(GraphQLNoteCreateResultType),
    args: {
      input: t.arg(t.NonNullInput(GraphQLNoteCreateInput)),
    },
    resolve: (_, args, context: GraphQLContext) =>
      RT.run(
        pipe(
          requireAuth(context),
          RT.chainW(() => createNote(args.input)),
          RT.chainW((note) => {
            context.liveQueryStore.invalidate(["Query.notes", "Query.note"]);
            return RT.of({
              __typename: "NoteCreateSuccess",
              note,
            });
          }),
          RT.orElse((err) =>
            RT.of({
              __typename: "NoteCreateError",
              reason: err.message,
            })
          )
        ),
        context
      ),
  }),
];
```

## Transaction Safety

### 1. Atomic Multi-Step Operations

```typescript
// server/map-lib.ts
export const deleteMapWithTokens =
  (mapId: string): RTE.ReaderTaskEither<Dependencies, Error, void> =>
  ({ db }) =>
    TE.tryCatch(() => {
      db.exec("BEGIN TRANSACTION");
      try {
        // Delete tokens
        db.prepare("DELETE FROM map_tokens WHERE map_id = ?").run(mapId);

        // Delete map
        db.prepare("DELETE FROM maps WHERE id = ?").run(mapId);

        db.exec("COMMIT");
      } catch (err) {
        db.exec("ROLLBACK");
        throw err;
      }
    }, E.toError);
```

### 2. Rollback on Error

```typescript
// server/notes-lib.ts
export const updateNoteWithChildren =
  (
    noteId: string,
    updates: Partial<NoteModelType>
  ): RTE.ReaderTaskEither<Dependencies, Error, NoteModelType> =>
  ({ db }) =>
    TE.tryCatch(() => {
      db.exec("BEGIN");
      try {
        // Update parent
        db.prepare("UPDATE notes SET ? WHERE id = ?").run(updates, noteId);

        // Update children (if needed)
        db.prepare("UPDATE notes SET parent_id = ? WHERE parent_id = ?").run(
          noteId,
          noteId
        );

        db.exec("COMMIT");

        // Fetch updated note
        return db.prepare("SELECT * FROM notes WHERE id = ?").get(noteId);
      } catch (err) {
        db.exec("ROLLBACK");
        throw err;
      }
    }, E.toError).chain((row) => TE.fromEither(decodeNote(row)));
```

## Query Optimization

### 1. Indexes for Common Queries

```typescript
// server/migrations/3.ts
export const migrate = ({ db }: MigrationContext) => {
  db.exec(`
    -- Speed up parent_id lookups
    CREATE INDEX idx_notes_parent_id ON notes(parent_id);
    
    -- Speed up created_at sorting
    CREATE INDEX idx_notes_created_at ON notes(created_at DESC);
    
    -- Speed up map_id lookups in tokens
    CREATE INDEX idx_map_tokens_map_id ON map_tokens(map_id);
    
    -- Speed up combined queries
    CREATE INDEX idx_notes_parent_created ON notes(parent_id, created_at DESC);
  `);
};
```

### 2. Prepared Statements (Built-in with better-sqlite3)

```typescript
// Already using prepared statements = automatic caching
const stmt = db.prepare("SELECT * FROM notes WHERE id = ?");

// This statement is cached internally
stmt.get("note-1");
stmt.get("note-2");
stmt.get("note-3");
```

## Common Errors & Solutions

### Error: "Cannot read property 'id' of undefined"

**Problem**: Row doesn't exist or decoder failed
**Solution**:

```typescript
export const getNoteById = (
  id: string
): E.Either<DecodeError, NoteModelType> => {
  const row = db.prepare("SELECT * FROM notes WHERE id = ?").get(id);

  if (!row) {
    return E.left(new Error(`Note ${id} not found`));
  }

  return decodeNote(row);
};
```

### Error: "SQLITE_CONSTRAINT: UNIQUE constraint failed"

**Problem**: Attempted to insert duplicate ID or unique value
**Solution**:

```typescript
const result = db.prepare("INSERT INTO notes (id, ...) VALUES (?, ...)").run(id, ...);

if (!result.changes) {
  return E.left(new Error("Insert failed - likely duplicate key"));
}
```

### Error: "SQLITE_BUSY: database is locked"

**Problem**: Long-running transaction blocking other writers
**Solution**:

```typescript
// Enable WAL mode (already done in initialization)
db.pragma("journal_mode = WAL");

// For long operations, use timeout
db.exec("PRAGMA busy_timeout = 5000"); // 5 seconds
```
