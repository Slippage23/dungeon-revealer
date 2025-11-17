# Socket.IO & Real-time Subscriptions Patterns

## Overview

Dungeon Revealer uses Socket.IO with GraphQL Live Queries for real-time updates. Clients connect via WebSocket at `/api/socket.io` and receive push updates when data changes.

## Authentication Flow

### 1. Socket Connection with Bearer Token

```typescript
// Frontend: src/socket.ts
import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  path: "/api/socket.io",
  auth: (callback) => {
    callback({
      token: `Bearer ${dmPassword}`,
    });
  },
});

socket.on("authenticated", () => {
  console.log("Connected as DM");
  // Relay environment now authenticated
});
```

### 2. Server-side Session Store

```typescript
// Backend: server/socket-session-store.ts
const socketSessionStore = createSocketSessionStore();

io.on("connection", (socket) => {
  socket.on("authenticate", ({ password }) => {
    const role = getRole(password); // "DM" or "PC"
    if (role === null) return;

    socketSessionStore.set(socket, {
      id: socket.id,
      role: role === "DM" ? "admin" : "user",
    });
  });
});
```

## GraphQL Live Query Subscriptions

### 1. Server-side Subscription Setup

Subscriptions defined in `server/graphql/modules/{feature}.ts`:

```typescript
// Example: Chat messages subscription
export const subscriptionFields = [
  t.subscriptionField({
    name: "chatMessagesAdded",
    type: t.NonNull(GraphQLChatMessagesAddedSubscriptionType),
    subscribe: (_, __, context) => context.chat.subscribe.newMessages(),
  }),
];
```

### 2. Frontend Query with @live Directive

Queries automatically re-fetch when server invalidates:

```tsx
const MapQuery = graphql`
  query dmArea_MapQuery($loadedMapId: ID!, $noMap: Boolean!) @live {
    map(id: $loadedMapId) @skip(if: $noMap) {
      id
      ...dmMap_DMMapFragment
    }
    activeMap {
      id
    }
  }
`;

const Content = () => {
  const { data } = useQuery(MapQuery, {
    loadedMapId,
    noMap: false,
  });
  // Automatically re-renders when server calls:
  // context.liveQueryStore.invalidate(["Query.map"])
};
```

### 3. Server-side Live Query Invalidation

After mutations, notify all connected clients:

```typescript
// Backend: server/graphql/modules/map.ts
export const mutationFields = [
  t.field({
    name: "mapTokenCreate",
    type: t.NonNull(GraphQLMapTokenCreateResultType),
    args: {
      input: t.arg(t.NonNullInput(GraphQLMapTokenCreateInput)),
    },
    resolve: (_, args, context) =>
      RT.run(
        pipe(
          createToken(args.input),
          RT.chain((token) => {
            // Notify all subscribers that map tokens changed
            context.liveQueryStore.invalidate(["Query.map"]);
            return RT.of(token);
          })
        ),
        context
      ),
  }),
];
```

## Real-time Subscription Patterns

### 1. useSubscription Hook Pattern

Subscribe to real-time events in components:

```tsx
// Frontend: Chat, Map Pings, etc.
import { useSubscription } from "relay-hooks";
import graphql from "babel-plugin-relay/macro";

const MapPingSubscription = graphql`
  subscription mapView_MapPingSubscription($mapId: ID!) {
    mapPing(mapId: $mapId) {
      id
      x
      y
    }
  }
`;

const MapPingRenderer = ({ mapId }) => {
  const [markedAreas, setMarkedAreas] = React.useState([]);

  useSubscription(
    React.useMemo(
      () => ({
        subscription: MapPingSubscription,
        variables: { mapId },
        onNext: (data) => {
          if (data?.mapPing) {
            setMarkedAreas((areas) => [...areas, data.mapPing]);
          }
        },
        onError: (err) => console.error("Subscription error:", err),
      }),
      [mapId]
    )
  );

  return (
    <group>
      {markedAreas.map((area) => (
        <MarkedAreaRenderer key={area.id} {...area} />
      ))}
    </group>
  );
};
```

### 2. User Update Subscriptions

Track connected users in real-time:

```tsx
// Frontend: src/authenticated-app-shell.tsx
const UserUpdateSubscription = graphql`
  subscription authenticatedAppShell_UserUpdateSubscription {
    userUpdate {
      ... on UserAddUpdate {
        user {
          id
          name
        }
      }
      ... on UserRemoveUpdate {
        userId
      }
      ... on UserChangeUpdateType {
        user {
          id
          name
        }
      }
    }
  }
`;

export const AuthenticatedAppShell = ({ ... }) => {
  useSubscription(
    React.useMemo(
      () => ({
        subscription: UserUpdateSubscription,
        onNext: (data) => {
          // Update user list in real-time
          if (data.userUpdate.type === "ADD") {
            context.user.add(data.userUpdate.user);
          }
        },
      }),
      []
    )
  );

  return <>{/* render UI with live user list */}</>;
};
```

### 3. Chat Message Subscriptions

Handle incoming chat messages:

```tsx
// Frontend: src/chat/dice-roll-notes.tsx
const ChatSubscription = graphql`
  subscription chatMessages_ChatMessagesAddedSubscription {
    chatMessagesAdded {
      messages {
        id
        ...chatMessage_message
      }
    }
  }
`;

export const DiceRollNotes = () => {
  useSubscription(
    React.useMemo(
      () => ({
        subscription: ChatSubscription,
        onNext: (data) => {
          // Relay automatically updates cache
          // Component re-renders with new messages
        },
      }),
      []
    )
  );

  return (/* chat UI */);
};
```

## Broadcasting Patterns

### 1. Invalidate Multiple Resources

Trigger updates across multiple queries:

```typescript
// Backend: After complex operation
context.liveQueryStore.invalidate([
  "Query.map",
  "Query.combatState",
  "Query.tokenDataForMap",
  "Query.notes",
]);
```

### 2. Conditional Broadcasting

Only notify relevant clients (DM vs Players):

```typescript
// Backend: server/graphql/modules/map.ts
export const queryFields = [
  t.field({
    name: "tokens",
    type: t.NonNull(t.List(t.NonNull(GraphQLMapTokenType))),
    resolve: (source, _, context) =>
      // DM sees all tokens, players see only visible ones
      context.session.role === "admin"
        ? source.tokens
        : source.tokens.filter((t) => t.isVisibleForPlayers),
  }),
];

// After updating visibility:
context.liveQueryStore.invalidate(["Query.map"]);
// Each client's @live query refetches with their role applied
```

### 3. Event-driven Invalidation

Specific events trigger specific cache updates:

```typescript
// Backend: server/notes-lib.ts
export const createNote = (input: NoteCreateInput): RTE.ReaderTaskEither<...> =>
  pipe(
    db.createNote(input),
    RTE.chainW((note) => {
      // Notify all subscribers that notes list changed
      return pipe(
        invalidateResources(["Query.notes"]),
        RTE.map(() => note)
      );
    })
  );
```

## Common Issues & Solutions

### Issue: Subscriptions Not Triggering

**Problem**: Client receives no updates after server invalidates
**Solution**:

1. Verify `@live` directive is on query
2. Check `liveQueryStore.invalidate()` is called
3. Confirm socket is authenticated (check `/authenticated` event)
4. Inspect DevTools Network tab for Socket.IO messages

### Issue: Stale Data After Reconnection

**Problem**: Client misses updates while disconnected
**Solution**:

```tsx
socket.on("connect", () => {
  // Force re-fetch on reconnect
  refetch();
});

socket.on("disconnect", () => {
  // Clear optimistic updates if needed
  clearOptimisticUpdates();
});
```

### Issue: Memory Leaks from Subscriptions

**Problem**: Multiple subscriptions accumulate in memory
**Solution**:

```tsx
useSubscription(
  React.useMemo(
    () => ({
      subscription: MapQuery,
      variables: { mapId },
      // Cleanup on unmount
    }),
    [mapId]
  )
);
// Relay handles unsubscribe automatically on component unmount
```

## Testing Subscriptions

### Mock Socket Connection

```typescript
// Jest test example
const mockSocket = {
  on: jest.fn(),
  once: jest.fn(),
  off: jest.fn(),
  emit: jest.fn(),
};

const socketSessionStore = createSocketSessionStore();
socketSessionStore.set(mockSocket, {
  id: "test-socket-id",
  role: "admin",
});

// Verify store maintains session
expect(socketSessionStore.get("test-socket-id")).toEqual({
  id: "test-socket-id",
  role: "admin",
});
```

### Test Live Query Invalidation

```typescript
const mockLiveQueryStore = {
  invalidate: jest.fn(),
};

const context = {
  liveQueryStore: mockLiveQueryStore,
  // ... other context
};

// Run mutation
await mutateToken(input, context);

// Verify invalidation was called
expect(mockLiveQueryStore.invalidate).toHaveBeenCalledWith(["Query.map"]);
```
