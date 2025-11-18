import graphql from "babel-plugin-relay/macro";
import { useMutation, useQuery } from "relay-hooks";
import { useCallback } from "react";
import { useNoteCategoriesQuery } from "./__generated__/useNoteCategoriesQuery.graphql";
import { useNoteCategoriesCreateMutation } from "./__generated__/useNoteCategoriesCreateMutation.graphql";
import { useNoteCategoriesUpdateMutation } from "./__generated__/useNoteCategoriesUpdateMutation.graphql";
import { useNoteCategoriesDeleteMutation } from "./__generated__/useNoteCategoriesDeleteMutation.graphql";

const CategoriesQuery = graphql`
  query useNoteCategoriesQuery($mapId: String!) {
    noteCategoryTree(mapId: $mapId) {
      id
      name
      displayOrder
      parentId
      noteCount
      children {
        id
        name
        displayOrder
        parentId
        noteCount
        children {
          id
          name
          displayOrder
          parentId
          noteCount
        }
      }
    }
  }
`;

const CreateCategoryM = graphql`
  mutation useNoteCategoriesCreateMutation($input: NoteCategoryCreateInput!) {
    createNoteCategory(input: $input) {
      category {
        id
        name
        displayOrder
        parentId
        createdAt
      }
    }
  }
`;

const UpdateCategoryM = graphql`
  mutation useNoteCategoriesUpdateMutation($input: NoteCategoryUpdateInput!) {
    updateNoteCategory(input: $input) {
      category {
        id
        name
        displayOrder
        parentId
        createdAt
      }
    }
  }
`;

const DeleteCategoryM = graphql`
  mutation useNoteCategoriesDeleteMutation($input: NoteCategoryDeleteInput!) {
    deleteNoteCategory(input: $input) {
      success
    }
  }
`;

/**
 * Hook to fetch categories for a map
 */
export const useNoteCategories = (mapId: string) => {
  const result = useQuery<useNoteCategoriesQuery>(CategoriesQuery, {
    mapId,
  });
  return result;
};

/**
 * Hook to create a new category
 */
export const useCreateNoteCategory = () => {
  const [mutate] =
    useMutation<useNoteCategoriesCreateMutation>(CreateCategoryM);

  const createCategory = useCallback(
    (input: {
      mapId: string;
      name: string;
      parentId?: string;
      displayOrder?: number;
    }) => {
      return new Promise<void>((resolve, reject) => {
        mutate({
          variables: { input },
          onCompleted: () => {
            resolve();
          },
          onError: (err) => {
            reject(err);
          },
        });
      });
    },
    [mutate]
  );

  return createCategory;
};

/**
 * Hook to update an existing category
 */
export const useUpdateNoteCategory = () => {
  const [mutate] =
    useMutation<useNoteCategoriesUpdateMutation>(UpdateCategoryM);

  const updateCategory = useCallback(
    (input: {
      categoryId: string;
      name?: string;
      parentId?: string | null;
      displayOrder?: number;
    }) => {
      return new Promise<void>((resolve, reject) => {
        mutate({
          variables: { input: { id: input.categoryId, ...input } },
          onCompleted: () => {
            resolve();
          },
          onError: (err) => {
            reject(err);
          },
        });
      });
    },
    [mutate]
  );

  return updateCategory;
};

/**
 * Hook to delete a category
 */
export const useDeleteNoteCategory = () => {
  const [mutate] =
    useMutation<useNoteCategoriesDeleteMutation>(DeleteCategoryM);

  const deleteCategory = useCallback(
    (categoryId: string) => {
      return new Promise<void>((resolve, reject) => {
        mutate({
          variables: { input: { id: categoryId } },
          onCompleted: () => {
            resolve();
          },
          onError: (err) => {
            reject(err);
          },
        });
      });
    },
    [mutate]
  );

  return deleteCategory;
};
