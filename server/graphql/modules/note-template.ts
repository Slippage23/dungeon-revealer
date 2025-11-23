/**
 * GraphQL Module for Note Templates
 * Exposes note template queries and mutations
 */

import { pipe, flow } from "fp-ts/lib/function";
import * as RTE from "fp-ts/lib/ReaderTaskEither";
import * as RT from "fp-ts/lib/ReaderTask";
import { t } from "..";
import * as noteTemplateDb from "../../note-template-db";
import * as noteTemplateTypes from "../../io-types/note-template";

// ============================================================================
// GraphQL Object Types
// ============================================================================

const GraphQLNoteTemplateFieldType =
  t.objectType<noteTemplateTypes.NoteTemplateFieldType>({
    name: "NoteTemplateField",
    description: "A field in a note template",
    fields: () => [
      t.field({
        name: "name",
        type: t.NonNull(t.String),
        resolve: (record) => record.name,
      }),
      t.field({
        name: "type",
        type: t.NonNull(t.String),
        resolve: (record) => record.type,
      }),
      t.field({
        name: "label",
        type: t.NonNull(t.String),
        resolve: (record) => record.label,
      }),
      t.field({
        name: "required",
        type: t.NonNull(t.Boolean),
        resolve: (record) => record.required,
      }),
      t.field({
        name: "placeholder",
        type: t.String,
        resolve: (record) => record.placeholder,
      }),
      t.field({
        name: "options",
        type: t.List(t.String),
        resolve: (record) => record.options || [],
      }),
    ],
  });

const GraphQLNoteTemplateType =
  t.objectType<noteTemplateTypes.NoteTemplateType>({
    name: "NoteTemplate",
    description: "A template for creating standardized notes",
    fields: () => [
      t.field({
        name: "id",
        type: t.NonNull(t.ID),
        resolve: (record) => record.id,
      }),
      t.field({
        name: "name",
        type: t.NonNull(t.String),
        resolve: (record) => record.name,
      }),
      t.field({
        name: "category",
        type: t.NonNull(t.String),
        resolve: (record) => record.category,
      }),
      t.field({
        name: "description",
        type: t.String,
        resolve: (record) => record.description,
      }),
      t.field({
        name: "schema",
        type: t.NonNull(t.String),
        resolve: (record) => record.schema,
      }),
      t.field({
        name: "isDefault",
        type: t.NonNull(t.Boolean),
        resolve: (record) => Boolean(record.isDefault),
      }),
      t.field({
        name: "createdAt",
        type: t.NonNull(t.Int),
        resolve: (record) => record.createdAt,
      }),
    ],
  });

// ============================================================================
// Input Types
// ============================================================================

const GraphQLNoteTemplateFieldInputType = t.inputObjectType({
  name: "NoteTemplateFieldInput",
  fields: () => ({
    name: { type: t.NonNullInput(t.String) },
    type: { type: t.NonNullInput(t.String) },
    label: { type: t.NonNullInput(t.String) },
    required: { type: t.NonNullInput(t.Boolean) },
    placeholder: { type: t.String },
    options: { type: t.ListInput(t.String) },
  }),
});

const GraphQLNoteTemplateCreateInputType = t.inputObjectType({
  name: "NoteTemplateCreateInput",
  fields: () => ({
    mapId: { type: t.String },
    name: { type: t.NonNullInput(t.String) },
    category: { type: t.NonNullInput(t.String) },
    description: { type: t.String },
    schema: { type: t.NonNullInput(t.String) },
    isDefault: { type: t.Boolean },
  }),
});

const GraphQLNoteTemplateDeleteInputType = t.inputObjectType({
  name: "NoteTemplateDeleteInput",
  fields: () => ({
    templateId: { type: t.NonNullInput(t.String) },
  }),
});

// ============================================================================
// Result Types
// ============================================================================

const GraphQLNoteTemplateCreateResultType = t.objectType<{
  template: noteTemplateTypes.NoteTemplateType;
}>({
  name: "NoteTemplateCreateResult",
  fields: () => [
    t.field({
      name: "template",
      type: t.NonNull(GraphQLNoteTemplateType),
      resolve: (obj) => obj.template,
    }),
  ],
});

const GraphQLNoteTemplateDeleteResultType = t.objectType<{
  success: boolean;
}>({
  name: "NoteTemplateDeleteResult",
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

const resolveNoteTemplatesQuery = (mapId: string) =>
  pipe(
    noteTemplateDb.getNoteTemplatesByMapId(mapId),
    RTE.fold(
      (err) => {
        console.error("Failed to fetch note templates:", err);
        return RT.of([]);
      },
      (templates) => RT.of(templates)
    )
  );

const resolveNoteTemplateCreate = (input: {
  mapId: string | null | undefined;
  name: string;
  category: string;
  description: string | null | undefined;
  schema: string;
  isDefault: boolean | null | undefined;
}) =>
  pipe(
    noteTemplateDb.createNoteTemplate({
      mapId: input.mapId || "",
      name: input.name,
      category: input.category,
      description: input.description || undefined,
      schema: input.schema,
      isDefault: input.isDefault || undefined,
    }),
    RTE.fold(
      (err) => {
        throw new Error(`Failed to create note template: ${err}`);
      },
      (template) => RT.of({ template })
    )
  );

const resolveNoteTemplateDelete = (templateId: string) =>
  pipe(
    noteTemplateDb.deleteNoteTemplate(templateId),
    RTE.fold(
      (err) => {
        console.error("Failed to delete note template:", err);
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
    name: "noteTemplates",
    type: t.NonNull(t.List(t.NonNull(GraphQLNoteTemplateType))),
    args: {
      mapId: t.arg(t.NonNullInput(t.String)),
    },
    resolve: (_, args, context) =>
      RT.run(resolveNoteTemplatesQuery(args.mapId), context),
  }),
  t.field({
    name: "noteTemplate",
    type: GraphQLNoteTemplateType,
    args: {
      id: t.arg(t.NonNullInput(t.String)),
    },
    resolve: (_, args, context) =>
      RT.run(
        pipe(
          noteTemplateDb.getNoteTemplateById(args.id),
          RTE.fold(
            (err) => {
              throw err;
            },
            (template) => RT.of(template)
          )
        ),
        context
      ),
  }),
];

// ============================================================================
// Mutation Fields
// ============================================================================

export const mutationFields = [
  t.field({
    name: "createNoteTemplate",
    type: t.NonNull(GraphQLNoteTemplateCreateResultType),
    args: {
      input: t.arg(t.NonNullInput(GraphQLNoteTemplateCreateInputType)),
    },
    resolve: (_, { input }, context) =>
      RT.run(resolveNoteTemplateCreate(input), context),
  }),
  t.field({
    name: "deleteNoteTemplate",
    type: t.NonNull(GraphQLNoteTemplateDeleteResultType),
    args: {
      input: t.arg(t.NonNullInput(GraphQLNoteTemplateDeleteInputType)),
    },
    resolve: (_, { input }, context) =>
      RT.run(resolveNoteTemplateDelete(input.templateId), context),
  }),
];

// ============================================================================
// Subscription Fields
// ============================================================================

export const subscriptionFields = [];
