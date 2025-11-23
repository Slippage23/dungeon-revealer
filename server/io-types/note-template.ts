import * as t from "io-ts";

/**
 * Note template field definition for form generation
 */
export const NoteTemplateField = t.type({
  name: t.string,
  type: t.union([
    t.literal("text"),
    t.literal("textarea"),
    t.literal("number"),
    t.literal("select"),
    t.literal("checkbox"),
  ]),
  label: t.string,
  required: t.boolean,
  placeholder: t.union([t.string, t.undefined]),
  options: t.union([t.array(t.string), t.undefined]),
});

export type NoteTemplateFieldType = t.TypeOf<typeof NoteTemplateField>;

/**
 * Note template schema (JSON schema for fields)
 */
export const NoteTemplateSchema = t.type({
  fields: t.array(NoteTemplateField),
  description: t.union([t.string, t.undefined]),
});

export type NoteTemplateSchemaType = t.TypeOf<typeof NoteTemplateSchema>;

/**
 * Note template from database (camelCase keys after camelCaseKeys transformation)
 */
export const NoteTemplate = t.type({
  id: t.string,
  mapId: t.string,
  name: t.string,
  category: t.string,
  description: t.union([t.string, t.undefined]),
  schema: t.string, // JSON stringified
  isDefault: t.union([t.number, t.boolean]),
  createdAt: t.number,
  updatedAt: t.number,
});

export type NoteTemplateType = t.TypeOf<typeof NoteTemplate>;

/**
 * Decode a note template from database row
 */
export const decodeNoteTemplate = (
  input: unknown
): t.Validation<NoteTemplateType> => NoteTemplate.decode(input);

/**
 * Note template data stored with notes (template field values)
 */
export const NoteTemplateData = t.record(
  t.string,
  t.union([t.string, t.number, t.boolean, t.array(t.string), t.null])
);

export type NoteTemplateDataType = t.TypeOf<typeof NoteTemplateData>;
