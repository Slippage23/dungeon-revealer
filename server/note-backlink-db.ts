import * as RTE from "fp-ts/lib/ReaderTaskEither";
import * as TE from "fp-ts/lib/TaskEither";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import type { Database } from "sqlite";
import { camelCaseKeys } from "./util/camelcase-keys";
import * as noteBacklinkTypes from "./io-types/note-backlink";

type DecodeError = Error | any;
type Dependencies = {
  db: Database;
};

const getTimestamp = () => new Date().getTime();

/**
 * Get all backlinks TO a note (notes that link to this one)
 */
export const getBacklinksToNote =
  (
    toNoteId: string
  ): RTE.ReaderTaskEither<
    Dependencies,
    DecodeError,
    noteBacklinkTypes.NoteBacklinkType[]
  > =>
  ({ db }) =>
    pipe(
      TE.tryCatch(
        () =>
          db.all(
            /* SQL */ `
              SELECT * FROM "note_backlinks" 
              WHERE "to_note_id" = ? 
              ORDER BY "created_at" DESC
            `,
            toNoteId
          ),
        E.toError
      ),
      TE.map((rows) =>
        rows.map((row) =>
          pipe(
            row,
            (r) => camelCaseKeys(r),
            noteBacklinkTypes.decodeNoteBacklink,
            E.getOrElseW((err) => {
              console.error("Failed to decode note backlink:", err);
              throw new Error(
                `Failed to decode note backlink: ${JSON.stringify(err)}`
              );
            })
          )
        )
      )
    );

/**
 * Get all backlinks FROM a note (notes this one links to)
 */
export const getBacklinksFromNote =
  (
    fromNoteId: string
  ): RTE.ReaderTaskEither<
    Dependencies,
    DecodeError,
    noteBacklinkTypes.NoteBacklinkType[]
  > =>
  ({ db }) =>
    pipe(
      TE.tryCatch(
        () =>
          db.all(
            /* SQL */ `
              SELECT * FROM "note_backlinks" 
              WHERE "from_note_id" = ? 
              ORDER BY "created_at" DESC
            `,
            fromNoteId
          ),
        E.toError
      ),
      TE.map((rows) =>
        rows.map((row) =>
          pipe(
            row,
            (r) => camelCaseKeys(r),
            noteBacklinkTypes.decodeNoteBacklink,
            E.getOrElseW((err) => {
              console.error("Failed to decode note backlink:", err);
              throw new Error(
                `Failed to decode note backlink: ${JSON.stringify(err)}`
              );
            })
          )
        )
      )
    );

/**
 * Create a new backlink (when note A @mentions note B)
 */
export const createBacklink =
  (input: {
    fromNoteId: string;
    toNoteId: string;
    linkText?: string;
  }): RTE.ReaderTaskEither<
    Dependencies,
    DecodeError,
    noteBacklinkTypes.NoteBacklinkType
  > =>
  ({ db }) => {
    const now = getTimestamp();

    return pipe(
      TE.tryCatch(
        () =>
          db.run(
            /* SQL */ `
              INSERT OR IGNORE INTO "note_backlinks" 
              ("from_note_id", "to_note_id", "link_text", "created_at", "updated_at")
              VALUES (?, ?, ?, ?, ?)
            `,
            [input.fromNoteId, input.toNoteId, input.linkText || null, now, now]
          ),
        E.toError
      ),
      TE.chain(() =>
        pipe(
          TE.tryCatch(
            () =>
              db.get(
                /* SQL */ `
                  SELECT * FROM "note_backlinks" 
                  WHERE "from_note_id" = ? AND "to_note_id" = ?
                `,
                [input.fromNoteId, input.toNoteId]
              ),
            E.toError
          ),
          TE.chainW((row) => {
            if (!row) {
              return TE.left(new Error("Failed to create backlink"));
            }
            return pipe(
              row,
              (r) => camelCaseKeys(r),
              noteBacklinkTypes.decodeNoteBacklink,
              (result) =>
                result as E.Either<
                  DecodeError,
                  noteBacklinkTypes.NoteBacklinkType
                >,
              TE.fromEither
            );
          })
        )
      )
    );
  };

/**
 * Delete a backlink
 */
export const deleteBacklink =
  (
    fromNoteId: string,
    toNoteId: string
  ): RTE.ReaderTaskEither<Dependencies, DecodeError, void> =>
  ({ db }) =>
    pipe(
      TE.tryCatch(
        () =>
          db.run(
            /* SQL */ `
              DELETE FROM "note_backlinks" 
              WHERE "from_note_id" = ? AND "to_note_id" = ?
            `,
            [fromNoteId, toNoteId]
          ),
        E.toError
      ),
      TE.map(() => undefined)
    );

/**
 * Delete all backlinks FROM a note (when deleting a note)
 */
export const deleteBacklinksFromNote =
  (noteId: string): RTE.ReaderTaskEither<Dependencies, DecodeError, void> =>
  ({ db }) =>
    pipe(
      TE.tryCatch(
        () =>
          db.run(
            /* SQL */ `DELETE FROM "note_backlinks" WHERE "from_note_id" = ?`,
            noteId
          ),
        E.toError
      ),
      TE.map(() => undefined)
    );

/**
 * Delete all backlinks TO a note (when deleting a note)
 */
export const deleteBacklinksToNote =
  (noteId: string): RTE.ReaderTaskEither<Dependencies, DecodeError, void> =>
  ({ db }) =>
    pipe(
      TE.tryCatch(
        () =>
          db.run(
            /* SQL */ `DELETE FROM "note_backlinks" WHERE "to_note_id" = ?`,
            noteId
          ),
        E.toError
      ),
      TE.map(() => undefined)
    );
