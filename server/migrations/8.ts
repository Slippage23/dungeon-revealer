import * as sqlite from "sqlite";

/**
 * Migration 8: Note Backlinks System
 * Adds support for tracking @mention links between notes (for backlinking)
 */
export const migrate = async (deps: { db: sqlite.Database }) => {
  await deps.db.exec(/* SQL */ `
    BEGIN;
    PRAGMA "user_version" = 9;

    -- Track @mention links between notes (note A @mentions note B)
    CREATE TABLE "note_backlinks" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "from_note_id" TEXT NOT NULL,
      "to_note_id" TEXT NOT NULL,
      "link_text" TEXT,  -- The @mention text or anchor text
      "created_at" INTEGER NOT NULL,
      "updated_at" INTEGER NOT NULL,
      FOREIGN KEY ("from_note_id") REFERENCES "notes" ("id") ON DELETE CASCADE,
      FOREIGN KEY ("to_note_id") REFERENCES "notes" ("id") ON DELETE CASCADE
    );
    CREATE INDEX "index_note_backlinks_from_note_id" ON "note_backlinks" ("from_note_id");
    CREATE INDEX "index_note_backlinks_to_note_id" ON "note_backlinks" ("to_note_id");
    CREATE UNIQUE INDEX "index_note_backlinks_unique" ON "note_backlinks" ("from_note_id", "to_note_id");

    COMMIT;
  `);
};
