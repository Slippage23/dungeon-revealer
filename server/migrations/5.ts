import * as sqlite from "sqlite";

/**
 * Migration 5: Normalize token conditions to lowercase
 * Converts all existing uppercase condition values to lowercase
 * to match GraphQL enum values (e.g., CHARMED -> charmed)
 */
export const migrate = async (deps: { db: sqlite.Database }) => {
  await deps.db.exec(/* SQL */ `
    BEGIN;
    PRAGMA "user_version" = 6;

    -- Update all conditions in token_data to lowercase
    -- Parse JSON array, lowercase each value, and re-encode
    UPDATE token_data
    SET conditions = (
      SELECT json_group_array(LOWER(value))
      FROM json_each(token_data.conditions)
    )
    WHERE conditions IS NOT NULL AND conditions != '[]';

    COMMIT;
  `);
};
