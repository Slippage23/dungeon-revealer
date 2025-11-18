import graphql from "babel-plugin-relay/macro";
import { useMutation, useQuery } from "relay-hooks";
import { useCallback } from "react";
import { useNoteTemplatesQuery } from "./__generated__/useNoteTemplatesQuery.graphql";
import { useNoteTemplatesCreateMutation } from "./__generated__/useNoteTemplatesCreateMutation.graphql";
import { useNoteTemplatesDeleteMutation } from "./__generated__/useNoteTemplatesDeleteMutation.graphql";

const TemplatesQuery = graphql`
  query useNoteTemplatesQuery($mapId: String!) {
    noteTemplates(mapId: $mapId) {
      id
      name
      category
      description
      schema
      isDefault
      createdAt
    }
  }
`;

const CreateTemplateM = graphql`
  mutation useNoteTemplatesCreateMutation($input: NoteTemplateCreateInput!) {
    createNoteTemplate(input: $input) {
      template {
        id
        name
        category
        description
        schema
        isDefault
        createdAt
      }
    }
  }
`;

const DeleteTemplateM = graphql`
  mutation useNoteTemplatesDeleteMutation($input: NoteTemplateDeleteInput!) {
    deleteNoteTemplate(input: $input) {
      success
    }
  }
`;

/**
 * Hook to fetch templates for a map
 */
export const useNoteTemplates = (mapId: string) => {
  const result = useQuery<useNoteTemplatesQuery>(TemplatesQuery, {
    mapId,
  });
  return result;
};

/**
 * Hook to create a new template
 */
export const useCreateNoteTemplate = () => {
  const [mutate] = useMutation<useNoteTemplatesCreateMutation>(CreateTemplateM);

  const createTemplate = useCallback(
    (input: {
      mapId?: string;
      name: string;
      category: string;
      description?: string;
      schema: string;
      isDefault?: boolean;
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

  return createTemplate;
};

/**
 * Hook to delete a template
 */
export const useDeleteNoteTemplate = () => {
  const [mutate] = useMutation<useNoteTemplatesDeleteMutation>(DeleteTemplateM);

  const deleteTemplate = useCallback(
    (templateId: string) => {
      return new Promise<void>((resolve, reject) => {
        mutate({
          variables: { input: { templateId } },
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

  return deleteTemplate;
};
