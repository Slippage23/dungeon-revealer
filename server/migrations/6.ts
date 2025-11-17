import * as sqlite from "sqlite";

/**
 * Migration 6: Note Categories System
 * Adds support for organizing notes into categories with hierarchical structure
 */
export const migrate = async (deps: { db: sqlite.Database }) => {
  await deps.db.exec(/* SQL */ `
    BEGIN;
    PRAGMA "user_version" = 7;

    -- Note categories (supports hierarchy with parent_id)
    CREATE TABLE "note_categories" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "map_id" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "parent_id" TEXT,
      "display_order" INTEGER DEFAULT 0,
      "created_at" INTEGER NOT NULL,
      "updated_at" INTEGER NOT NULL,
      FOREIGN KEY ("parent_id") REFERENCES "note_categories" ("id") ON DELETE CASCADE,
      FOREIGN KEY ("map_id") REFERENCES "maps" ("id") ON DELETE CASCADE
    );
    CREATE INDEX "index_note_categories_map_id" ON "note_categories" ("map_id");
    CREATE INDEX "index_note_categories_parent_id" ON "note_categories" ("parent_id");

    -- Add category support to notes table
    ALTER TABLE "notes" ADD COLUMN "category_id" TEXT REFERENCES "note_categories" ("id") ON DELETE SET NULL;
    CREATE INDEX "index_notes_category_id" ON "notes" ("category_id");

    COMMIT;
  `);
};
