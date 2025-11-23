import * as React from "react";
import { Box, Button, HStack, VStack, Text, useToast } from "@chakra-ui/react";
import * as Icon from "../../feather-icons";
import {
  useNoteTemplates,
  useDeleteNoteTemplate,
} from "./hooks/use-note-templates";

export interface NoteTemplate {
  id: string;
  name: string;
  category: string;
  description?: string;
  schema: string;
  isDefault: boolean;
  createdAt: number;
}

interface NoteTemplateListProps {
  mapId: string;
  onTemplateSelect?: (template: NoteTemplate) => void;
  onCreateClick?: () => void;
}

/**
 * Component to display a list of note templates for a map
 */
export const NoteTemplateList: React.FC<NoteTemplateListProps> = ({
  mapId,
  onTemplateSelect,
  onCreateClick,
}) => {
  const templateQuery = useNoteTemplates(mapId);
  const deleteTemplate = useDeleteNoteTemplate();
  const toast = useToast();

  const handleDelete = React.useCallback(
    async (template: NoteTemplate) => {
      try {
        await deleteTemplate(template.id);
        toast({
          title: "Template deleted",
          description: `"${template.name}" has been deleted.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } catch (err) {
        toast({
          title: "Error deleting template",
          description:
            err instanceof Error ? err.message : "Unknown error occurred",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    },
    [deleteTemplate, toast]
  );

  if (templateQuery.isLoading) {
    return <Text>Loading templates... (mapId={mapId})</Text>;
  }

  if (templateQuery.error) {
    return (
      <VStack spacing={3}>
        <Text color="red.500">Error loading templates</Text>
        <Button size="sm" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </VStack>
    );
  }

  const templates = (templateQuery.data?.noteTemplates as NoteTemplate[]) || [];

  console.log("[NoteTemplateList] Templates array:", templates);
  console.log("[NoteTemplateList] Templates length:", templates.length);
  if (templates.length > 0) {
    console.log("[NoteTemplateList] First template:", templates[0]);
  }

  if (templates.length === 0) {
    return (
      <VStack spacing={3} py={4}>
        <Text fontSize="sm" color="gray.500">
          No templates yet. Create one to get started!
        </Text>
        <Button
          size="sm"
          leftIcon={<Icon.Plus size={16} />}
          onClick={onCreateClick}
        >
          Create Template
        </Button>
      </VStack>
    );
  }

  return (
    <VStack spacing={2} align="stretch">
      <HStack justify="space-between">
        <Text fontWeight="bold" fontSize="sm">
          Templates ({templates.length})
        </Text>
        <Button
          size="xs"
          leftIcon={<Icon.Plus size={14} />}
          onClick={onCreateClick}
        >
          New
        </Button>
      </HStack>

      {templates.map((template) => (
        <Box
          key={template.id}
          p={3}
          borderWidth="1px"
          borderRadius="md"
          cursor="pointer"
          _hover={{ bg: "gray.50" }}
          onClick={() => onTemplateSelect?.(template)}
        >
          <HStack justify="space-between" mb={1}>
            <VStack align="start" spacing={0}>
              <Text fontWeight="semibold" fontSize="sm">
                {template.name}
              </Text>
              <Text fontSize="xs" color="gray.600">
                {template.category}
              </Text>
            </VStack>
            <Button
              size="xs"
              variant="ghost"
              colorScheme="red"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(template);
              }}
            >
              <Icon.Trash size={14} />
            </Button>
          </HStack>
          {template.description && (
            <Text fontSize="xs" color="gray.500" noOfLines={2}>
              {template.description}
            </Text>
          )}
        </Box>
      ))}
    </VStack>
  );
};
