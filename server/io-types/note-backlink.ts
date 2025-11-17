import * as t from "io-ts";

/**
 * Note backlink from database (@mention link from one note to another)
 */
export const NoteBacklink = t.type({
  id: t.union([t.number, t.string]),
  from_note_id: t.string,
  to_note_id: t.string,
  link_text: t.union([t.string, t.null]),
  created_at: t.number,
  updated_at: t.number,
});

export type NoteBacklinkType = t.TypeOf<typeof NoteBacklink>;

/**
 * Decode a note backlink from database row
 */
export const decodeNoteBacklink = (
  input: unknown
): t.Validation<NoteBacklinkType> => NoteBacklink.decode(input);

/**
 * List of backlinks to a note
 */
export const NoteBacklinks = t.array(NoteBacklink);

export type NoteBacklinksType = t.TypeOf<typeof NoteBacklinks>;

/**
 * Decode a list of backlinks
 */
export const decodeNoteBacklinks = (
  input: unknown
): t.Validation<NoteBacklinksType> => NoteBacklinks.decode(input);
