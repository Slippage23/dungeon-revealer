import * as sqlite from "sqlite";

/**
 * Migration 7: Note Templates System
 * Adds predefined and custom note templates for standardized note creation
 */
export const migrate = async (deps: { db: sqlite.Database }) => {
  await deps.db.exec(/* SQL */ `
    BEGIN;
    PRAGMA "user_version" = 8;

    -- Note templates (default templates for Monster, NPC, Location, Quest, etc.)
    CREATE TABLE "note_templates" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "map_id" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "category" TEXT NOT NULL,
      "description" TEXT,
      "schema" TEXT NOT NULL,  -- JSON schema defining template fields
      "is_default" INTEGER DEFAULT 0,  -- Built-in templates
      "created_at" INTEGER NOT NULL,
      "updated_at" INTEGER NOT NULL,
      FOREIGN KEY ("map_id") REFERENCES "maps" ("id") ON DELETE CASCADE
    );
    CREATE INDEX "index_note_templates_map_id" ON "note_templates" ("map_id");
    CREATE INDEX "index_note_templates_category" ON "note_templates" ("category");

    -- Add template support to notes table
    ALTER TABLE "notes" ADD COLUMN "template_id" TEXT REFERENCES "note_templates" ("id") ON DELETE SET NULL;
    ALTER TABLE "notes" ADD COLUMN "template_data" TEXT;  -- JSON: template-specific field values
    CREATE INDEX "index_notes_template_id" ON "notes" ("template_id");

    -- Insert default templates
    INSERT INTO "note_templates" 
      ("id", "map_id", "name", "category", "description", "schema", "is_default", "created_at", "updated_at")
    VALUES
      ('tmpl-monster-1', '', 'Monster', 'Monster', 'Standard monster stat block', 
       '{"fields":["name","ac","hp","type","size","alignment","abilities"]}', 1, 
       strftime('%s'), strftime('%s')),
      ('tmpl-npc-1', '', 'NPC', 'NPC', 'Non-player character', 
       '{"fields":["name","title","faction","personality","goals"]}', 1, 
       strftime('%s'), strftime('%s')),
      ('tmpl-location-1', '', 'Location', 'Location', 'Map location or area', 
       '{"fields":["name","description","hazards","inhabitants"]}', 1, 
       strftime('%s'), strftime('%s')),
      ('tmpl-quest-1', '', 'Quest', 'Quest', 'Adventure hook or quest', 
       '{"fields":["name","giver","reward","objectives","complications"]}', 1, 
       strftime('%s'), strftime('%s')),
      ('tmpl-item-1', '', 'Item', 'Item', 'Magic item or equipment', 
       '{"fields":["name","rarity","effect","attunement","curse"]}', 1, 
       strftime('%s'), strftime('%s')),
      ('tmpl-trap-1', '', 'Trap', 'Trap', 'Hazard or trap', 
       '{"fields":["name","dc","trigger","effect","disarm"]}', 1, 
       strftime('%s'), strftime('%s')),
      ('tmpl-encounter-1', '', 'Encounter', 'Encounter', 'Combat encounter setup', 
       '{"fields":["name","difficulty","monsters","tactics","rewards"]}', 1, 
       strftime('%s'), strftime('%s'));

    COMMIT;
  `);
};
