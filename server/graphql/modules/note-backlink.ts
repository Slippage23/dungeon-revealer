/**
 * GraphQL Module for Note Backlinks
 * Exposes backlink queries and mutations for tracking note relationships
 */

import { pipe, flow } from "fp-ts/lib/function";
import * as RTE from "fp-ts/lib/ReaderTaskEither";
import * as RT from "fp-ts/lib/ReaderTask";
import { t } from "..";
import * as noteBacklinkDb from "../../note-backlink-db";
import * as noteBacklinkTypes from "../../io-types/note-backlink";

// ============================================================================
// GraphQL Object Types
// ============================================================================

const GraphQLNoteBacklinkType =
  t.objectType<noteBacklinkTypes.NoteBacklinkType>({
    name: "NoteBacklink",
    description: "A link from one note to another (via @mention)",
    fields: () => [
      t.field({
        name: "id",
        type: t.NonNull(t.String),
        resolve: (obj) => String(obj.id),
      }),
      t.field({
        name: "fromNoteId",
        type: t.NonNull(t.String),
        resolve: (obj) => obj.from_note_id,
      }),
      t.field({
        name: "toNoteId",
        type: t.NonNull(t.String),
        resolve: (obj) => obj.to_note_id,
      }),
      t.field({
        name: "linkText",
        type: t.String,
        resolve: (obj) => obj.link_text || undefined,
      }),
      t.field({
        name: "createdAt",
        type: t.NonNull(t.Int),
        resolve: (obj) => obj.created_at,
      }),
    ],
  });

// ============================================================================
// Input Types
// ============================================================================

const GraphQLNoteBacklinkCreateInputType = t.inputObjectType({
  name: "NoteBacklinkCreateInput",
  fields: () => ({
    fromNoteId: { type: t.NonNullInput(t.String) },
    toNoteId: { type: t.NonNullInput(t.String) },
    linkText: { type: t.String },
  }),
});

const GraphQLNoteBacklinkDeleteInputType = t.inputObjectType({
  name: "NoteBacklinkDeleteInput",
  fields: () => ({
    fromNoteId: { type: t.NonNullInput(t.String) },
    toNoteId: { type: t.NonNullInput(t.String) },
  }),
});

// ============================================================================
// Result Types
// ============================================================================

const GraphQLNoteBacklinkCreateResultType = t.objectType<{
  backlink: noteBacklinkTypes.NoteBacklinkType;
}>({
  name: "NoteBacklinkCreateResult",
  fields: () => [
    t.field({
      name: "backlink",
      type: t.NonNull(GraphQLNoteBacklinkType),
      resolve: (obj) => obj.backlink,
    }),
  ],
});

const GraphQLNoteBacklinkDeleteResultType = t.objectType<{
  success: boolean;
}>({
  name: "NoteBacklinkDeleteResult",
  fields: () => [
    t.field({
      name: "success",
      type: t.NonNull(t.Boolean),
      resolve: (obj) => obj.success,
    }),
  ],
});

// ============================================================================
// Resolvers
// ============================================================================

const resolveBacklinksTo = (noteId: string) =>
  pipe(
    noteBacklinkDb.getBacklinksToNote(noteId),
    RTE.fold(
      (err) => {
        console.error("Failed to fetch backlinks to note:", err);
        return RT.of([]);
      },
      (backlinks) => RT.of(backlinks)
    )
  );

const resolveBacklinksFrom = (noteId: string) =>
  pipe(
    noteBacklinkDb.getBacklinksFromNote(noteId),
    RTE.fold(
      (err) => {
        console.error("Failed to fetch backlinks from note:", err);
        return RT.of([]);
      },
      (backlinks) => RT.of(backlinks)
    )
  );

const resolveNoteBacklinkCreate = (input: {
  fromNoteId: string;
  toNoteId: string;
  linkText: string | null | undefined;
}) =>
  pipe(
    noteBacklinkDb.createBacklink({
      fromNoteId: input.fromNoteId,
      toNoteId: input.toNoteId,
      linkText: input.linkText || undefined,
    }),
    RTE.fold(
      (err) => {
        throw new Error(`Failed to create backlink: ${err}`);
      },
      (backlink) => RT.of({ backlink })
    )
  );

const resolveNoteBacklinkDelete = (fromNoteId: string, toNoteId: string) =>
  pipe(
    noteBacklinkDb.deleteBacklink(fromNoteId, toNoteId),
    RTE.fold(
      (err) => {
        console.error("Failed to delete backlink:", err);
        return RT.of({ success: false });
      },
      () => RT.of({ success: true })
    )
  );

// ============================================================================
// Query Fields
// ============================================================================

export const queryFields = [
  t.field({
    name: "backlinksTo",
    type: t.NonNull(t.List(t.NonNull(GraphQLNoteBacklinkType))),
    description: "Get all notes linking TO this note (incoming links)",
    args: {
      noteId: t.arg(t.NonNullInput(t.String)),
    },
    resolve: (_, args, context) =>
      RT.run(resolveBacklinksTo(args.noteId), context).then((result) => result),
  }),
  t.field({
    name: "backlinksFrom",
    type: t.NonNull(t.List(t.NonNull(GraphQLNoteBacklinkType))),
    description: "Get all notes this note links FROM (outgoing links)",
    args: {
      noteId: t.arg(t.NonNullInput(t.String)),
    },
    resolve: (_, args, context) =>
      RT.run(resolveBacklinksFrom(args.noteId), context).then(
        (result) => result
      ),
  }),
];

// ============================================================================
// Mutation Fields
// ============================================================================

export const mutationFields = [
  t.field({
    name: "createNoteBacklink",
    type: t.NonNull(GraphQLNoteBacklinkCreateResultType),
    args: {
      input: t.arg(t.NonNullInput(GraphQLNoteBacklinkCreateInputType)),
    },
    resolve: (_, { input }, context) =>
      RT.run(resolveNoteBacklinkCreate(input), context).then(
        (result) => result
      ),
  }),
  t.field({
    name: "deleteNoteBacklink",
    type: t.NonNull(GraphQLNoteBacklinkDeleteResultType),
    args: {
      input: t.arg(t.NonNullInput(GraphQLNoteBacklinkDeleteInputType)),
    },
    resolve: (_, { input }, context) =>
      RT.run(
        resolveNoteBacklinkDelete(input.fromNoteId, input.toNoteId),
        context
      ).then((result) => result),
  }),
];

// ============================================================================
// Subscription Fields
// ============================================================================

export const subscriptionFields = [];
