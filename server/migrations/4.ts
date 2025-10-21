import * as sqlite from "sqlite";

/**
 * Migration 4: Token Management System
 * Adds tables for tracking token HP, conditions, stats, and combat order
 */
export const migrate = async (deps: { db: sqlite.Database }) => {
  await deps.db.exec(/* SQL */ `
    BEGIN;
    PRAGMA "user_version" = 5;

    -- Token extended data (HP, conditions, stats)
    CREATE TABLE "token_data" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "token_id" TEXT NOT NULL UNIQUE,
      "map_id" TEXT NOT NULL,
      "current_hp" INTEGER,
      "max_hp" INTEGER,
      "temp_hp" INTEGER DEFAULT 0,
      "armor_class" INTEGER,
      "speed" INTEGER,
      "initiative_modifier" INTEGER DEFAULT 0,
      "conditions" TEXT, -- JSON array of condition names
      "notes" TEXT,
      "created_at" INTEGER NOT NULL,
      "updated_at" INTEGER NOT NULL
    );
    CREATE INDEX "index_token_data_token_id" ON "token_data" ("token_id");
    CREATE INDEX "index_token_data_map_id" ON "token_data" ("map_id");

    -- Initiative tracker state per map
    CREATE TABLE "initiative_order" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "map_id" TEXT NOT NULL,
      "token_id" TEXT NOT NULL,
      "initiative_value" INTEGER NOT NULL,
      "is_active" INTEGER DEFAULT 0, -- Boolean: is this token's turn?
      "round_number" INTEGER DEFAULT 1,
      "order_index" INTEGER NOT NULL,
      "created_at" INTEGER NOT NULL,
      "updated_at" INTEGER NOT NULL
    );
    CREATE INDEX "index_initiative_order_map_id" ON "initiative_order" ("map_id");
    CREATE INDEX "index_initiative_order_token_id" ON "initiative_order" ("token_id");
    CREATE UNIQUE INDEX "index_initiative_order_map_token" ON "initiative_order" ("map_id", "token_id");

    COMMIT;
  `);
};
