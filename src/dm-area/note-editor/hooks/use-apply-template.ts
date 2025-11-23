import graphql from "babel-plugin-relay/macro";
import { useMutation } from "relay-hooks";
import { useCallback } from "react";
import { useApplyTemplateMutation } from "./__generated__/useApplyTemplateMutation.graphql";
import type { NoteTemplate } from "../note-template-list";

const ApplyTemplateMutation = graphql`
  mutation useApplyTemplateMutation($input: NoteUpdateContentInput!) {
    noteUpdateContent(input: $input) {
      note {
        id
        content
      }
    }
  }
`;

/**
 * Hook to apply a note template to an existing note
 */
export const useApplyTemplate = () => {
  const [mutate] = useMutation<useApplyTemplateMutation>(ApplyTemplateMutation);

  const applyTemplate = useCallback(
    (noteId: string, template: NoteTemplate, currentContent: string = "") => {
      return new Promise<void>((resolve, reject) => {
        // Create template content - could be markdown or JSON
        // For now, create a simple markdown structure based on the schema
        let templateContent = `# ${template.name}\n\n`;

        try {
          const schema = JSON.parse(template.schema);
          if (schema.fields && Array.isArray(schema.fields)) {
            schema.fields.forEach((field: string) => {
              templateContent += `## ${field}\n\n`;
            });
          }
        } catch (e) {
          // If schema isn't valid JSON, just use the template name
        }

        // Append template to existing content (with separator if content exists)
        const separator = currentContent.trim() ? "\n\n---\n\n" : "";
        const content = currentContent + separator + templateContent;

        console.log("[USE-APPLY-TEMPLATE] Sending mutation with:", {
          noteId,
          currentContentLength: currentContent.length,
          templateContentLength: templateContent.length,
          totalContentLength: content.length,
        });

        mutate({
          variables: {
            input: {
              id: noteId,
              content,
            },
          },
          optimisticResponse: {
            noteUpdateContent: {
              note: {
                id: noteId,
                content: content,
              },
            },
          } as any,
          onCompleted: () => {
            console.log("[USE-APPLY-TEMPLATE] Mutation completed successfully");
            resolve();
          },
          onError: (err) => {
            console.error("[USE-APPLY-TEMPLATE] Mutation error:", err);
            reject(err);
          },
        });
      });
    },
    [mutate]
  );

  return applyTemplate;
};
