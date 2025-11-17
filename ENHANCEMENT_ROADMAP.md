# Dungeon Revealer Enhancement Roadmap

**Project Goal:** Enhance Dungeon Revealer with advanced token management, rich note system, automation, and AI assistance for in-person tabletop gaming.

**Key Constraints:**
- Designed for in-person play (no voice/video needed)
- Focus on local asset management
- Keep it performant and stable
- Maintain existing functionality

---

## Phase 1: Advanced Token Management ⭐ **START HERE**

### Overview
Transform basic tokens into rich game objects with stats, HP tracking, conditions, and initiative management.

### Database Schema Changes

#### New Migration File: `server/migrations/4.ts`

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

### New Type Definitions

#### File: `server/token-types.ts` (NEW)

```typescript
export interface TokenStats {
  hp: {
    current: number;
    max: number;
  };
  ac: number;
  initiative?: number;
  speed: number;
  // Optional D&D 5e stats
  abilities?: {
    str?: number;
    dex?: number;
    con?: number;
    int?: number;
    wis?: number;
    cha?: number;
  };
}

export interface TokenCondition {
  id: string; // unique identifier
  name: string; // "Poisoned", "Prone", "Blessed", "Stunned", etc.
  icon: string; // emoji or icon name (☠️, 😵, ✨, etc.)
  duration?: number; // rounds remaining, undefined = permanent
  description?: string;
  color?: string; // for visual indicator
}

export interface TokenData {
  id: string; // Primary key
  mapId: string;
  tokenId: string; // References the visual token on the map
  name: string;
  stats: TokenStats;
  conditions: TokenCondition[];
  linkedNoteId?: string; // Link to note with full monster/NPC details
  createdAt: number;
  updatedAt: number;
}

// Common condition presets
export const COMMON_CONDITIONS = [
  { name: "Blinded", icon: "👁️", color: "#666" },
  { name: "Charmed", icon: "💕", color: "#ff69b4" },
  { name: "Deafened", icon: "🔇", color: "#999" },
  { name: "Frightened", icon: "😨", color: "#ff6b6b" },
  { name: "Grappled", icon: "🤝", color: "#8b4513" },
  { name: "Incapacitated", icon: "💫", color: "#dda0dd" },
  { name: "Invisible", icon: "👻", color: "#e0e0e0" },
  { name: "Paralyzed", icon: "❄️", color: "#87ceeb" },
  { name: "Petrified", icon: "🗿", color: "#808080" },
  { name: "Poisoned", icon: "☠️", color: "#9acd32" },
  { name: "Prone", icon: "⬇️", color: "#8b4513" },
  { name: "Restrained", icon: "⛓️", color: "#696969" },
  { name: "Stunned", icon: "😵", color: "#ffd700" },
  { name: "Unconscious", icon: "😴", color: "#4169e1" },
  // Beneficial conditions
  { name: "Blessed", icon: "✨", color: "#ffd700" },
  { name: "Hasted", icon: "⚡", color: "#ffff00" },
  { name: "Inspired", icon: "🎵", color: "#ff69b4" },
  { name: "Invisible", icon: "👻", color: "#e0e0e0" },
  { name: "Protected", icon: "🛡️", color: "#4169e1" },
  { name: "Raging", icon: "😤", color: "#ff0000" },
];
```

### Database Access Layer

#### File: `server/token-data-db.ts` (NEW)

```typescript
import Database from "better-sqlite3";
import { TokenData, TokenStats, TokenCondition } from "./token-types";

export class TokenDataDB {
  constructor(private db: Database.Database) {}

  // Create or update token data
  upsertTokenData(data: Omit<TokenData, "createdAt" | "updatedAt">): TokenData {
    const now = Date.now();
    
    const stmt = this.db.prepare(`
      INSERT INTO token_data (id, map_id, token_id, name, stats, conditions, linked_note_id, created_at, updated_at)
      VALUES (@id, @mapId, @tokenId, @name, @stats, @conditions, @linkedNoteId, @createdAt, @updatedAt)
      ON CONFLICT(id) DO UPDATE SET
        name = @name,
        stats = @stats,
        conditions = @conditions,
        linked_note_id = @linkedNoteId,
        updated_at = @updatedAt
    `);

    stmt.run({
      id: data.id,
      mapId: data.mapId,
      tokenId: data.tokenId,
      name: data.name,
      stats: JSON.stringify(data.stats),
      conditions: JSON.stringify(data.conditions),
      linkedNoteId: data.linkedNoteId || null,
      createdAt: now,
      updatedAt: now,
    });

    return this.getTokenData(data.id)!;
  }

  // Get token data by ID
  getTokenData(id: string): TokenData | null {
    const stmt = this.db.prepare(`
      SELECT * FROM token_data WHERE id = ?
    `);
    
    const row = stmt.get(id) as any;
    if (!row) return null;

    return {
      id: row.id,
      mapId: row.map_id,
      tokenId: row.token_id,
      name: row.name,
      stats: JSON.parse(row.stats),
      conditions: JSON.parse(row.conditions),
      linkedNoteId: row.linked_note_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  // Get all token data for a map
  getTokenDataForMap(mapId: string): TokenData[] {
    const stmt = this.db.prepare(`
      SELECT * FROM token_data WHERE map_id = ? ORDER BY name
    `);
    
    const rows = stmt.all(mapId) as any[];
    return rows.map(row => ({
      id: row.id,
      mapId: row.map_id,
      tokenId: row.token_id,
      name: row.name,
      stats: JSON.parse(row.stats),
      conditions: JSON.parse(row.conditions),
      linkedNoteId: row.linked_note_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  // Update HP
  updateHP(id: string, current: number, max?: number): void {
    const tokenData = this.getTokenData(id);
    if (!tokenData) throw new Error("Token data not found");

    tokenData.stats.hp.current = Math.max(0, Math.min(current, tokenData.stats.hp.max));
    if (max !== undefined) {
      tokenData.stats.hp.max = Math.max(1, max);
    }

    this.upsertTokenData(tokenData);
  }

  // Add condition
  addCondition(id: string, condition: TokenCondition): void {
    const tokenData = this.getTokenData(id);
    if (!tokenData) throw new Error("Token data not found");

    // Don't add duplicate conditions
    if (!tokenData.conditions.find(c => c.id === condition.id)) {
      tokenData.conditions.push(condition);
      this.upsertTokenData(tokenData);
    }
  }

  // Remove condition
  removeCondition(id: string, conditionId: string): void {
    const tokenData = this.getTokenData(id);
    if (!tokenData) throw new Error("Token data not found");

    tokenData.conditions = tokenData.conditions.filter(c => c.id !== conditionId);
    this.upsertTokenData(tokenData);
  }

  // Decrement condition durations (called at end of round)
  decrementConditionDurations(mapId: string): void {
    const tokens = this.getTokenDataForMap(mapId);
    
    tokens.forEach(token => {
      let modified = false;
      token.conditions = token.conditions.filter(condition => {
        if (condition.duration !== undefined) {
          condition.duration--;
          if (condition.duration <= 0) {
            modified = true;
            return false; // Remove expired condition
          }
        }
        return true;
      });

      if (modified) {
        this.upsertTokenData(token);
      }
    });
  }

  // Delete token data
  deleteTokenData(id: string): void {
    const stmt = this.db.prepare(`DELETE FROM token_data WHERE id = ?`);
    stmt.run(id);
  }

  // Delete all token data for a map
  deleteTokenDataForMap(mapId: string): void {
    const stmt = this.db.prepare(`DELETE FROM token_data WHERE map_id = ?`);
    stmt.run(mapId);
  }
}
```

### GraphQL Schema Extensions

#### File: `server/graphql/modules/token-data.ts` (NEW)

```typescript
import { GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLInputObjectType } from "graphql";
import { TokenDataDB } from "../../token-data-db";
import { COMMON_CONDITIONS } from "../../token-types";

// GraphQL Types
const TokenHPType = new GraphQLObjectType({
  name: "TokenHP",
  fields: {
    current: { type: GraphQLInt },
    max: { type: GraphQLInt },
  },
});

export const TokenStatsType = new GraphQLObjectType({
  name: "TokenStats",
  fields: () => ({
    hp: { type: TokenHPType },
    ac: { type: GraphQLInt },
    initiative: { type: GraphQLInt },
    speed: { type: GraphQLInt },
  }),
});

export const TokenConditionType = new GraphQLObjectType({
  name: "TokenCondition",
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    icon: { type: GraphQLString },
    duration: { type: GraphQLInt },
    description: { type: GraphQLString },
    color: { type: GraphQLString },
  }),
});

export const TokenDataType = new GraphQLObjectType({
  name: "TokenData",
  fields: () => ({
    id: { type: GraphQLString },
    mapId: { type: GraphQLString },
    tokenId: { type: GraphQLString },
    name: { type: GraphQLString },
    stats: { type: TokenStatsType },
    conditions: { type: new GraphQLList(TokenConditionType) },
    linkedNoteId: { type: GraphQLString },
    createdAt: { type: GraphQLInt },
    updatedAt: { type: GraphQLInt },
  }),
});

// Input Types
const TokenHPInputType = new GraphQLInputObjectType({
  name: "TokenHPInput",
  fields: {
    current: { type: GraphQLInt },
    max: { type: GraphQLInt },
  },
});

export const TokenStatsInputType = new GraphQLInputObjectType({
  name: "TokenStatsInput",
  fields: {
    hp: { type: TokenHPInputType },
    ac: { type: GraphQLInt },
    initiative: { type: GraphQLInt },
    speed: { type: GraphQLInt },
  },
});

export const TokenConditionInputType = new GraphQLInputObjectType({
  name: "TokenConditionInput",
  fields: {
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    icon: { type: GraphQLString },
    duration: { type: GraphQLInt },
    description: { type: GraphQLString },
    color: { type: GraphQLString },
  },
});

// Queries
export const tokenDataQueries = {
  tokenData: {
    type: TokenDataType,
    args: {
      id: { type: new GraphQLNonNull(GraphQLString) },
    },
    resolve: (parent: any, args: any, context: any) => {
      const db = new TokenDataDB(context.db);
      return db.getTokenData(args.id);
    },
  },
  tokenDataForMap: {
    type: new GraphQLList(TokenDataType),
    args: {
      mapId: { type: new GraphQLNonNull(GraphQLString) },
    },
    resolve: (parent: any, args: any, context: any) => {
      const db = new TokenDataDB(context.db);
      return db.getTokenDataForMap(args.mapId);
    },
  },
  commonConditions: {
    type: new GraphQLList(TokenConditionType),
    resolve: () => COMMON_CONDITIONS,
  },
};

// Mutations
export const tokenDataMutations = {
  upsertTokenData: {
    type: TokenDataType,
    args: {
      id: { type: new GraphQLNonNull(GraphQLString) },
      mapId: { type: new GraphQLNonNull(GraphQLString) },
      tokenId: { type: new GraphQLNonNull(GraphQLString) },
      name: { type: new GraphQLNonNull(GraphQLString) },
      stats: { type: new GraphQLNonNull(TokenStatsInputType) },
      conditions: { type: new GraphQLList(TokenConditionInputType) },
      linkedNoteId: { type: GraphQLString },
    },
    resolve: (parent: any, args: any, context: any) => {
      const db = new TokenDataDB(context.db);
      return db.upsertTokenData(args);
    },
  },
  updateTokenHP: {
    type: TokenDataType,
    args: {
      id: { type: new GraphQLNonNull(GraphQLString) },
      current: { type: new GraphQLNonNull(GraphQLInt) },
      max: { type: GraphQLInt },
    },
    resolve: (parent: any, args: any, context: any) => {
      const db = new TokenDataDB(context.db);
      db.updateHP(args.id, args.current, args.max);
      return db.getTokenData(args.id);
    },
  },
  addTokenCondition: {
    type: TokenDataType,
    args: {
      id: { type: new GraphQLNonNull(GraphQLString) },
      condition: { type: new GraphQLNonNull(TokenConditionInputType) },
    },
    resolve: (parent: any, args: any, context: any) => {
      const db = new TokenDataDB(context.db);
      db.addCondition(args.id, args.condition);
      return db.getTokenData(args.id);
    },
  },
  removeTokenCondition: {
    type: TokenDataType,
    args: {
      id: { type: new GraphQLNonNull(GraphQLString) },
      conditionId: { type: new GraphQLNonNull(GraphQLString) },
    },
    resolve: (parent: any, args: any, context: any) => {
      const db = new TokenDataDB(context.db);
      db.removeCondition(args.id, args.conditionId);
      return db.getTokenData(args.id);
    },
  },
  decrementConditionDurations: {
    type: new GraphQLList(TokenDataType),
    args: {
      mapId: { type: new GraphQLNonNull(GraphQLString) },
    },
    resolve: (parent: any, args: any, context: any) => {
      const db = new TokenDataDB(context.db);
      db.decrementConditionDurations(args.mapId);
      return db.getTokenDataForMap(args.mapId);
    },
  },
  deleteTokenData: {
    type: GraphQLString,
    args: {
      id: { type: new GraphQLNonNull(GraphQLString) },
    },
    resolve: (parent: any, args: any, context: any) => {
      const db = new TokenDataDB(context.db);
      db.deleteTokenData(args.id);
      return args.id;
    },
  },
};
```

### Register GraphQL Module

#### File: `server/graphql/index.ts` (MODIFY)

Add the following imports and registration:

```typescript
import { tokenDataQueries, tokenDataMutations } from "./modules/token-data";

// In your schema builder, add:
// To Query type:
...tokenDataQueries,

// To Mutation type:
...tokenDataMutations,
```

