/**
 * GraphQL Module for Note Categories
 * Exposes note category queries and mutations with hierarchical support
 */

import { pipe, flow } from "fp-ts/lib/function";
import * as RTE from "fp-ts/lib/ReaderTaskEither";
import * as RT from "fp-ts/lib/ReaderTask";
import { t } from "..";
import * as noteCategoryDb from "../../note-category-db";
import * as noteCategoryTypes from "../../io-types/note-category";

// ============================================================================
// GraphQL Object Types
// ============================================================================

const GraphQLNoteCategoryNodeType: any =
  t.objectType<noteCategoryTypes.NoteCategoryNodeType>({
    name: "NoteCategoryNode",
    description: "A hierarchical category node with child categories",
    fields: () => [
      t.field({
        name: "id",
        type: t.NonNull(t.ID),
        resolve: (obj) => obj.id,
      }),
      t.field({
        name: "name",
        type: t.NonNull(t.String),
        resolve: (obj) => obj.name,
      }),
      t.field({
        name: "parentId",
        type: t.String,
        resolve: (obj) => obj.parent_id || undefined,
      }),
      t.field({
        name: "displayOrder",
        type: t.Int,
        resolve: (obj) => obj.display_order || undefined,
      }),
      t.field({
        name: "noteCount",
        type: t.Int,
        resolve: (obj) => obj.note_count || 0,
      }),
      t.field({
        name: "children",
        type: t.NonNull(t.List(t.NonNull(GraphQLNoteCategoryNodeType))),
        resolve: (obj) => obj.children || [],
      }),
    ],
  });

const GraphQLNoteCategoryType =
  t.objectType<noteCategoryTypes.NoteCategoryType>({
    name: "NoteCategory",
    description: "A category for organizing notes",
    fields: () => [
      t.field({
        name: "id",
        type: t.NonNull(t.ID),
        resolve: (obj) => obj.id,
      }),
      t.field({
        name: "mapId",
        type: t.NonNull(t.String),
        resolve: (obj) => obj.map_id,
      }),
      t.field({
        name: "name",
        type: t.NonNull(t.String),
        resolve: (obj) => obj.name,
      }),
      t.field({
        name: "parentId",
        type: t.String,
        resolve: (obj) => obj.parent_id,
      }),
      t.field({
        name: "displayOrder",
        type: t.Int,
        resolve: (obj) => obj.display_order,
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

const GraphQLNoteCategoryCreateInputType = t.inputObjectType({
  name: "NoteCategoryCreateInput",
  fields: () => ({
    mapId: { type: t.NonNullInput(t.String) },
    name: { type: t.NonNullInput(t.String) },
    parentId: { type: t.String },
    displayOrder: { type: t.Int },
  }),
});

const GraphQLNoteCategoryUpdateInputType = t.inputObjectType({
  name: "NoteCategoryUpdateInput",
  fields: () => ({
    id: { type: t.NonNullInput(t.String) },
    name: { type: t.String },
    parentId: { type: t.String },
    displayOrder: { type: t.Int },
  }),
});

const GraphQLNoteCategoryDeleteInputType = t.inputObjectType({
  name: "NoteCategoryDeleteInput",
  fields: () => ({
    id: { type: t.NonNullInput(t.String) },
  }),
});

// ============================================================================
// Result Types
// ============================================================================

const GraphQLNoteCategoryCreateResultType = t.objectType<{
  category: noteCategoryTypes.NoteCategoryType;
}>({
  name: "NoteCategoryCreateResult",
  fields: () => [
    t.field({
      name: "category",
      type: t.NonNull(GraphQLNoteCategoryType),
      resolve: (obj) => obj.category,
    }),
  ],
});

const GraphQLNoteCategoryUpdateResultType = t.objectType<{
  category: noteCategoryTypes.NoteCategoryType;
}>({
  name: "NoteCategoryUpdateResult",
  fields: () => [
    t.field({
      name: "category",
      type: t.NonNull(GraphQLNoteCategoryType),
      resolve: (obj) => obj.category,
    }),
  ],
});

const GraphQLNoteCategoryDeleteResultType = t.objectType<{
  success: boolean;
}>({
  name: "NoteCategoryDeleteResult",
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

const resolveNoteCategoryTreeQuery = (mapId: string) =>
  pipe(
    noteCategoryDb.getNoteCategoriesByMapId(mapId),
    RTE.map((categories) => noteCategoryDb.buildCategoryTree(categories)),
    RTE.fold(
      (err) => {
        console.error("Failed to fetch category tree:", err);
        return RT.of([]);
      },
      (tree) => RT.of(tree)
    )
  );

const resolveNoteCategoryCreate = (input: {
  mapId: string;
  name: string;
  parentId: string | null | undefined;
  displayOrder: number | null | undefined;
}) =>
  pipe(
    noteCategoryDb.createNoteCategory({
      mapId: input.mapId,
      name: input.name,
      parentId: input.parentId || undefined,
      displayOrder: input.displayOrder || 0,
    }),
    RTE.fold(
      (err) => {
        throw new Error(`Failed to create category: ${err}`);
      },
      (category) => RT.of({ category })
    )
  );

const resolveNoteCategoryUpdate = (input: {
  id: string;
  name: string | null | undefined;
  parentId: string | null | undefined;
  displayOrder: number | null | undefined;
}) =>
  pipe(
    noteCategoryDb.updateNoteCategory(input.id, {
      name: input.name || undefined,
      parentId: input.parentId || undefined,
      displayOrder:
        input.displayOrder !== null && input.displayOrder !== undefined
          ? input.displayOrder
          : undefined,
    }),
    RTE.fold(
      (err) => {
        throw new Error(`Failed to update category: ${err}`);
      },
      (category) => RT.of({ category })
    )
  );

const resolveNoteCategoryDelete = (id: string) =>
  pipe(
    noteCategoryDb.deleteNoteCategory(id),
    RTE.fold(
      (err) => {
        console.error("Failed to delete category:", err);
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
    name: "noteCategoryTree",
    type: t.NonNull(t.List(t.NonNull(GraphQLNoteCategoryNodeType))),
    args: {
      mapId: t.arg(t.NonNullInput(t.String)),
    },
    resolve: (_, args, context) =>
      RT.run(resolveNoteCategoryTreeQuery(args.mapId), context),
  }),
  t.field({
    name: "noteCategories",
    type: t.NonNull(t.List(t.NonNull(GraphQLNoteCategoryType))),
    args: {
      mapId: t.arg(t.NonNullInput(t.String)),
    },
    resolve: (_, args, context) =>
      RT.run(
        pipe(
          noteCategoryDb.getNoteCategoriesByMapId(args.mapId),
          RTE.fold(
            (err) => {
              console.error("Failed to fetch categories:", err);
              return RT.of([]);
            },
            (categories) => RT.of(categories)
          )
        ),
        context
      ),
  }),
  t.field({
    name: "noteCategory",
    type: GraphQLNoteCategoryType,
    args: {
      id: t.arg(t.NonNullInput(t.String)),
    },
    resolve: (_, args, context) =>
      RT.run(
        pipe(
          noteCategoryDb.getNoteCategoryById(args.id),
          RTE.fold(
            (err) => {
              throw err;
            },
            (category) => RT.of(category)
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
    name: "createNoteCategory",
    type: t.NonNull(GraphQLNoteCategoryCreateResultType),
    args: {
      input: t.arg(t.NonNullInput(GraphQLNoteCategoryCreateInputType)),
    },
    resolve: (_, { input }, context) =>
      RT.run(resolveNoteCategoryCreate(input), context),
  }),
  t.field({
    name: "updateNoteCategory",
    type: t.NonNull(GraphQLNoteCategoryUpdateResultType),
    args: {
      input: t.arg(t.NonNullInput(GraphQLNoteCategoryUpdateInputType)),
    },
    resolve: (_, { input }, context) =>
      RT.run(resolveNoteCategoryUpdate(input), context),
  }),
  t.field({
    name: "deleteNoteCategory",
    type: t.NonNull(GraphQLNoteCategoryDeleteResultType),
    args: {
      input: t.arg(t.NonNullInput(GraphQLNoteCategoryDeleteInputType)),
    },
    resolve: (_, { input }, context) =>
      RT.run(resolveNoteCategoryDelete(input.id), context),
  }),
];

// ============================================================================
// Subscription Fields
// ============================================================================

export const subscriptionFields = [];
