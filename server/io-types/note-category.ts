import * as t from "io-ts";

/**
 * Note category from database (hierarchical structure)
 */
export const NoteCategory = t.type({
  id: t.string,
  map_id: t.string,
  name: t.string,
  parent_id: t.union([t.string, t.null]),
  display_order: t.union([t.number, t.undefined]),
  created_at: t.number,
  updated_at: t.number,
});

export type NoteCategoryType = t.TypeOf<typeof NoteCategory>;

/**
 * Decode a note category from database row
 */
export const decodeNoteCategory = (
  input: unknown
): t.Validation<NoteCategoryType> => NoteCategory.decode(input);

/**
 * Note category with recursive children (runtime type for building tree structures)
 * This is built programmatically from flat category lists, not decoded from io-ts
 */
export interface NoteCategoryNodeType {
  id: string;
  name: string;
  parent_id: string | null;
  display_order?: number;
  children: NoteCategoryNodeType[];
  note_count?: number;
}
