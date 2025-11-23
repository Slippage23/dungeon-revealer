import * as RTE from "fp-ts/lib/ReaderTaskEither";
import * as TE from "fp-ts/lib/TaskEither";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import type { Database } from "sqlite";
import { camelCaseKeys } from "./util/camelcase-keys";
import * as noteTemplateTypes from "./io-types/note-template";

type DecodeError = Error | any;
type Dependencies = {
  db: Database;
};

const getTimestamp = () => new Date().getTime();

/**
 * Get all note templates for a map (including default templates)
 */
export const getNoteTemplatesByMapId =
  (
    mapId: string
  ): RTE.ReaderTaskEither<
    Dependencies,
    DecodeError,
    noteTemplateTypes.NoteTemplateType[]
  > =>
  ({ db }) =>
    pipe(
      TE.tryCatch(
        () =>
          db.all(
            /* SQL */ `
              SELECT * FROM "note_templates" 
              WHERE "map_id" = '' OR "map_id" = ? 
              ORDER BY "name" ASC
            `,
            mapId
          ),
        E.toError
      ),
      TE.map((rows) => {
        console.log(
          "[NoteTemplateDb] getNoteTemplatesByMapId: Got rows count:",
          rows.length
        );
        if (rows.length > 0) {
          console.log("[NoteTemplateDb] First row (raw):", rows[0]);
          console.log(
            "[NoteTemplateDb] First row (after camelCaseKeys):",
            camelCaseKeys(rows[0])
          );
        }
        return rows.map((row) =>
          pipe(
            row,
            (r) => camelCaseKeys(r),
            noteTemplateTypes.decodeNoteTemplate,
            E.getOrElseW((err) => {
              console.error("Failed to decode note template:", err);
              throw new Error(
                `Failed to decode note template: ${JSON.stringify(err)}`
              );
            })
          )
        );
      })
    );

/**
 * Get a single note template by ID
 */
export const getNoteTemplateById =
  (
    templateId: string
  ): RTE.ReaderTaskEither<
    Dependencies,
    DecodeError,
    noteTemplateTypes.NoteTemplateType | null
  > =>
  ({ db }) =>
    pipe(
      TE.tryCatch(
        () =>
          db.get(
            /* SQL */ `
              SELECT * FROM "note_templates" WHERE "id" = ?
            `,
            templateId
          ),
        E.toError
      ),
      TE.chainW((row) => {
        if (!row) return TE.right(null);
        return pipe(
          row,
          (r) => camelCaseKeys(r),
          noteTemplateTypes.decodeNoteTemplate,
          TE.fromEither
        );
      })
    );

/**
 * Create a new note template
 */
export const createNoteTemplate =
  (input: {
    mapId: string;
    name: string;
    category: string;
    description?: string;
    schema: string;
    isDefault?: boolean;
  }): RTE.ReaderTaskEither<
    Dependencies,
    DecodeError,
    noteTemplateTypes.NoteTemplateType
  > =>
  ({ db }) => {
    const id = `tmpl-${input.category.toLowerCase()}-${getTimestamp()}`;
    const now = getTimestamp();

    return pipe(
      TE.tryCatch(
        () =>
          db.run(
            /* SQL */ `
              INSERT INTO "note_templates" 
              ("id", "map_id", "name", "category", "description", "schema", "is_default", "created_at", "updated_at")
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
              id,
              input.mapId,
              input.name,
              input.category,
              input.description || null,
              input.schema,
              input.isDefault ? 1 : 0,
              now,
              now,
            ]
          ),
        E.toError
      ),
      TE.chain(() => getNoteTemplateById(id)({ db })),
      TE.chain((template) => {
        if (!template) {
          return TE.left(new Error("Failed to create template"));
        }
        return TE.right(template);
      })
    );
  };

/**
 * Delete a note template
 */
export const deleteNoteTemplate =
  (templateId: string): RTE.ReaderTaskEither<Dependencies, DecodeError, void> =>
  ({ db }) =>
    pipe(
      TE.tryCatch(
        () =>
          db.run(
            /* SQL */ `DELETE FROM "note_templates" WHERE "id" = ?`,
            templateId
          ),
        E.toError
      ),
      TE.map(() => undefined)
    );
