import * as RTE from "fp-ts/lib/ReaderTaskEither";
import * as TE from "fp-ts/lib/TaskEither";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import type { Database } from "sqlite";
import { camelCaseKeys } from "./util/camelcase-keys";
import * as noteCategoryTypes from "./io-types/note-category";

type DecodeError = Error | any;
type Dependencies = {
  db: Database;
};

const getTimestamp = () => new Date().getTime();

/**
 * Get all note categories for a map
 */
export const getNoteCategoriesByMapId =
  (
    mapId: string
  ): RTE.ReaderTaskEither<
    Dependencies,
    DecodeError,
    noteCategoryTypes.NoteCategoryType[]
  > =>
  ({ db }) =>
    pipe(
      TE.tryCatch(
        () =>
          db.all(
            /* SQL */ `
              SELECT * FROM "note_categories" 
              WHERE "map_id" = ? 
              ORDER BY "parent_id" ASC, "display_order" ASC, "name" ASC
            `,
            mapId
          ),
        E.toError
      ),
      TE.map((rows) =>
        rows.map((row) =>
          pipe(
            row,
            (r) => camelCaseKeys(r),
            noteCategoryTypes.decodeNoteCategory,
            E.getOrElseW((err) => {
              console.error("Failed to decode note category:", err);
              throw new Error(
                `Failed to decode note category: ${JSON.stringify(err)}`
              );
            })
          )
        )
      )
    );

/**
 * Get a single note category by ID
 */
export const getNoteCategoryById =
  (
    categoryId: string
  ): RTE.ReaderTaskEither<
    Dependencies,
    DecodeError,
    noteCategoryTypes.NoteCategoryType | null
  > =>
  ({ db }) =>
    pipe(
      TE.tryCatch(
        () =>
          db.get(
            /* SQL */ `
              SELECT * FROM "note_categories" WHERE "id" = ?
            `,
            categoryId
          ),
        E.toError
      ),
      TE.chainW((row) => {
        if (!row) return TE.right(null);
        return pipe(
          row,
          (r) => camelCaseKeys(r),
          noteCategoryTypes.decodeNoteCategory,
          TE.fromEither
        );
      })
    );

/**
 * Create a new note category
 */
export const createNoteCategory =
  (input: {
    mapId: string;
    name: string;
    parentId?: string | null;
    displayOrder?: number;
  }): RTE.ReaderTaskEither<
    Dependencies,
    DecodeError,
    noteCategoryTypes.NoteCategoryType
  > =>
  ({ db }) => {
    const id = `cat-${input.name
      .toLowerCase()
      .replace(/\s+/g, "-")}-${getTimestamp()}`;
    const now = getTimestamp();

    return pipe(
      TE.tryCatch(
        () =>
          db.run(
            /* SQL */ `
              INSERT INTO "note_categories" 
              ("id", "map_id", "name", "parent_id", "display_order", "created_at", "updated_at")
              VALUES (?, ?, ?, ?, ?, ?, ?)
            `,
            [
              id,
              input.mapId,
              input.name,
              input.parentId || null,
              input.displayOrder || 0,
              now,
              now,
            ]
          ),
        E.toError
      ),
      TE.chain(() => getNoteCategoryById(id)({ db })),
      TE.chain((category) => {
        if (!category) {
          return TE.left(new Error("Failed to create category"));
        }
        return TE.right(category);
      })
    );
  };

/**
 * Update a note category
 */
export const updateNoteCategory =
  (
    categoryId: string,
    input: {
      name?: string;
      parentId?: string | null;
      displayOrder?: number;
    }
  ): RTE.ReaderTaskEither<
    Dependencies,
    DecodeError,
    noteCategoryTypes.NoteCategoryType
  > =>
  ({ db }) => {
    const now = getTimestamp();
    const updates: string[] = [];
    const values: any[] = [];

    if (input.name !== undefined) {
      updates.push(`"name" = ?`);
      values.push(input.name);
    }
    if (input.parentId !== undefined) {
      updates.push(`"parent_id" = ?`);
      values.push(input.parentId);
    }
    if (input.displayOrder !== undefined) {
      updates.push(`"display_order" = ?`);
      values.push(input.displayOrder);
    }

    if (updates.length === 0) {
      return pipe(
        getNoteCategoryById(categoryId)({ db }),
        TE.chainW((cat) => {
          if (!cat) return TE.left(new Error("Category not found"));
          return TE.right(cat);
        })
      );
    }

    updates.push(`"updated_at" = ?`);
    values.push(now);
    values.push(categoryId);

    return pipe(
      TE.tryCatch(
        () =>
          db.run(
            /* SQL */ `
              UPDATE "note_categories" 
              SET ${updates.join(", ")}
              WHERE "id" = ?
            `,
            values
          ),
        E.toError
      ),
      TE.chain(() => getNoteCategoryById(categoryId)({ db })),
      TE.chainW((category) => {
        if (!category) {
          return TE.left(new Error("Failed to update category"));
        }
        return TE.right(category);
      })
    );
  };

/**
 * Delete a note category
 */
export const deleteNoteCategory =
  (categoryId: string): RTE.ReaderTaskEither<Dependencies, DecodeError, void> =>
  ({ db }) =>
    pipe(
      TE.tryCatch(
        () =>
          db.run(
            /* SQL */ `DELETE FROM "note_categories" WHERE "id" = ?`,
            categoryId
          ),
        E.toError
      ),
      TE.map(() => undefined)
    );

/**
 * Build a hierarchical tree from flat category list
 */
export const buildCategoryTree = (
  categories: noteCategoryTypes.NoteCategoryType[]
): noteCategoryTypes.NoteCategoryNodeType[] => {
  const categoryMap = new Map<string, noteCategoryTypes.NoteCategoryNodeType>();
  const rootNodes: noteCategoryTypes.NoteCategoryNodeType[] = [];

  // Create node for each category
  categories.forEach((cat) => {
    categoryMap.set(cat.id, {
      id: cat.id,
      name: cat.name,
      parent_id: cat.parent_id,
      display_order: cat.display_order,
      children: [],
      note_count: 0,
    });
  });

  // Build tree
  categories.forEach((cat) => {
    const node = categoryMap.get(cat.id);
    if (!node) return;

    if (!cat.parent_id) {
      rootNodes.push(node);
    } else {
      const parent = categoryMap.get(cat.parent_id);
      if (parent) {
        parent.children.push(node);
      }
    }
  });

  // Sort children
  const sortChildren = (node: noteCategoryTypes.NoteCategoryNodeType) => {
    node.children.sort(
      (a, b) => (a.display_order || 0) - (b.display_order || 0)
    );
    node.children.forEach(sortChildren);
  };

  rootNodes.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  rootNodes.forEach(sortChildren);

  return rootNodes;
};
