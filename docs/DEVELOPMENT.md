# Development Guide

## Quick Start

```bash
# Clone and install
git clone https://github.com/dungeon-revealer/dungeon-revealer.git
cd dungeon-revealer
npm install

# Start development servers
npm run start:frontend:dev  # Vite on :4000, proxies to :3000
npm run start:server:dev    # ts-node-dev on :3000

# Run tests
npm test
```

## Architecture

### Stack Overview

- **Frontend**: React 18, TypeScript, Vite, Relay GraphQL
- **Backend**: Express.js, Socket.IO, SQLite, gqtx GraphQL
- **Real-time**: GraphQL Live Queries via `@n1ru4l/graphql-live-query`

### Directory Structure

```
dungeon-revealer/
├── src/                    # Frontend React application
│   ├── dm-area/           # DM-specific components
│   ├── player-area/       # Player-specific components
│   ├── admin-area/        # Admin panel components
│   └── relay-environment.ts
├── server/                 # Backend Express application
│   ├── graphql/           # GraphQL schema and resolvers
│   │   └── modules/       # Feature-specific modules
│   ├── migrations/        # SQLite migrations
│   └── server.ts          # Main server entry
├── build/                  # Compiled frontend (Vite output)
├── server-build/          # Compiled backend (TypeScript output)
└── data/                   # Runtime data (SQLite, uploads)
```

### Key Patterns

#### fp-ts for Functional Programming

```typescript
import * as RT from "fp-ts/lib/ReaderTask";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";

// ReaderTask for dependency injection
export const getNoteById =
  (id: string): RT.ReaderTask<Context, Note> =>
  ({ db }) =>
    pipe(db.get("SELECT * FROM notes WHERE id = ?", id), RT.map(decodeNote));
```

#### io-ts for Runtime Type Checking

```typescript
import * as t from "io-ts";

const NoteModel = t.type({
  id: t.string,
  title: t.string,
  content: t.string,
  isEntryPoint: BooleanFromNumber,
});
```

#### Relay for GraphQL

```tsx
import graphql from "babel-plugin-relay/macro";
import { useMutation } from "relay-hooks";

const CreateNoteMutation = graphql`
  mutation noteCreateMutation($input: NoteCreateInput!) {
    noteCreate(input: $input) {
      note {
        id
        title
      }
    }
  }
`;
```

## GraphQL Development

### Adding a New Field

1. Define in `server/graphql/modules/{feature}.ts`
2. Export in `queryFields`, `mutationFields`, or `subscriptionFields`
3. Register in `server/graphql/index.ts`
4. Run `npm run relay-compiler` to generate types

### Live Query Invalidation

```typescript
// After mutation, invalidate affected queries
context.liveQueryStore.invalidate(["Query.notes", "Query.maps"]);
```

## Database

### Migrations

Add new migrations to `server/migrations/{number}.ts`:

```typescript
export const migrate = ({ db }) => {
  db.exec(`
    ALTER TABLE notes ADD COLUMN archived INTEGER DEFAULT 0;
  `);
};
```

### Cursor Pagination

```typescript
// Encode cursor: base64({ lastCreatedAt, lastId })
// Decode and use in WHERE clause
WHERE (created_at, id) > (?, ?) ORDER BY created_at, id LIMIT ?
```

## Testing

```bash
npm test                    # Run all tests
npm test -- --watch        # Watch mode
npm test -- notes.spec.ts  # Single file
```

### Test Structure

```typescript
describe("getNoteById", () => {
  it("returns note when found", async () => {
    const context = { db: mockDb, session: { id: "1", role: "admin" } };
    const result = await RT.run(getNoteById("123"), context)();
    expect(E.isRight(result)).toBe(true);
  });
});
```

## Build Commands

| Command                  | Description               |
| ------------------------ | ------------------------- |
| `npm run build`          | Build frontend + backend  |
| `npm run build:frontend` | Vite production build     |
| `npm run build:server`   | TypeScript compilation    |
| `npm run relay-compiler` | Generate Relay types      |
| `npm run compile:win`    | Create Windows executable |

## Environment Variables

| Variable      | Description                    | Default         |
| ------------- | ------------------------------ | --------------- |
| `DM_PASSWORD` | DM authentication password     | (none - public) |
| `PC_PASSWORD` | Player authentication password | (none - public) |
| `PORT`        | Server port                    | 3000            |
| `PUBLIC_URL`  | Public URL for assets          | (auto)          |

## Code Style

- ESLint + Prettier configured
- Husky pre-commit hooks
- TypeScript strict mode enabled

```bash
npm run lint        # Check linting
npm run lint:fix    # Auto-fix issues
npm run format      # Format with Prettier
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make changes following code style
4. Add tests for new functionality
5. Run `npm test` and `npm run lint`
6. Submit a pull request

See [CONTRIBUTING.md](../CONTRIBUTING.md) for detailed guidelines.
