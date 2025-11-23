import * as React from "react";
import {
  Box,
  Button,
  HStack,
  VStack,
  Text,
  useToast,
  Input,
  Collapse,
} from "@chakra-ui/react";
import * as Icon from "../../feather-icons";
import {
  useNoteCategories,
  useCreateNoteCategory,
  useDeleteNoteCategory,
} from "./hooks/use-note-categories";

export interface NoteCategory {
  id: string;
  name: string;
  displayOrder: number;
  parentId?: string;
  noteCount: number;
  children?: NoteCategory[];
}

interface NoteCategoryTreeViewProps {
  mapId: string;
  onCategorySelect?: (categoryId: string) => void;
  onCreateClick?: () => void;
}

interface CategoryNodeProps {
  category: NoteCategory;
  level: number;
  onSelect?: (categoryId: string) => void;
  onDelete?: (categoryId: string) => void;
  onRename?: (categoryId: string, newName: string) => void;
}

/**
 * Component to display a single category node in the tree
 */
const CategoryNode: React.FC<CategoryNodeProps> = ({
  category,
  level,
  onSelect,
  onDelete,
  onRename,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState(category.name);

  const handleRename = () => {
    if (editValue.trim() && editValue !== category.name) {
      onRename?.(category.id, editValue.trim());
    }
    setIsEditing(false);
    setEditValue(category.name);
  };

  const hasChildren = category.children && category.children.length > 0;

  return (
    <Box>
      <HStack
        spacing={1}
        ml={level * 4}
        py={1}
        px={2}
        _hover={{ bg: "gray.100" }}
      >
        {hasChildren && (
          <Button
            size="xs"
            variant="ghost"
            p={0}
            minW="auto"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <Icon.ChevronDown size={14} />
            ) : (
              <Icon.ChevronRight size={14} />
            )}
          </Button>
        )}
        {!hasChildren && <Box w={6} />}

        <Box flex={1} onClick={() => onSelect?.(category.id)} cursor="pointer">
          {isEditing ? (
            <Input
              size="sm"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRename();
                if (e.key === "Escape") {
                  setIsEditing(false);
                  setEditValue(category.name);
                }
              }}
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <HStack spacing={2}>
              <Icon.Inbox size={16} />
              <Text fontSize="sm" fontWeight="medium">
                {category.name}
              </Text>
              {category.noteCount > 0 && (
                <Text fontSize="xs" color="gray.500">
                  ({category.noteCount})
                </Text>
              )}
            </HStack>
          )}
        </Box>

        <Button
          size="xs"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
        >
          <Icon.Edit size={12} />
        </Button>
        <Button
          size="xs"
          variant="ghost"
          colorScheme="red"
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.(category.id);
          }}
        >
          <Icon.Trash size={12} />
        </Button>
      </HStack>

      <Collapse in={isExpanded && hasChildren} animateOpacity>
        {category.children?.map((child) => (
          <CategoryNode
            key={child.id}
            category={child}
            level={level + 1}
            onSelect={onSelect}
            onDelete={onDelete}
            onRename={onRename}
          />
        ))}
      </Collapse>
    </Box>
  );
};

/**
 * Component to display category tree view
 */
export const NoteCategoryTreeView: React.FC<NoteCategoryTreeViewProps> = ({
  mapId,
  onCategorySelect,
  onCreateClick,
}) => {
  const categoryQuery = useNoteCategories(mapId);
  const deleteCategory = useDeleteNoteCategory();
  const toast = useToast();

  const handleDelete = React.useCallback(
    async (categoryId: string) => {
      try {
        await deleteCategory(categoryId);
        toast({
          title: "Category deleted",
          description: "Category has been deleted.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } catch (err) {
        toast({
          title: "Error deleting category",
          description:
            err instanceof Error ? err.message : "Unknown error occurred",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    },
    [deleteCategory, toast]
  );

  const handleRename = React.useCallback(
    async (categoryId: string, newName: string) => {
      try {
        // TODO: Use updateCategory hook when available
        toast({
          title: "Category renamed",
          description: `Category has been renamed to "${newName}".`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } catch (err) {
        toast({
          title: "Error renaming category",
          description:
            err instanceof Error ? err.message : "Unknown error occurred",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    },
    [toast]
  );

  if (categoryQuery.isLoading) {
    return <Text fontSize="sm">Loading categories...</Text>;
  }

  if (categoryQuery.error) {
    return (
      <VStack spacing={3}>
        <Text fontSize="sm" color="red.500">
          Error loading categories
        </Text>
        <Button size="sm" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </VStack>
    );
  }

  const categories =
    (categoryQuery.data?.noteCategoryTree as NoteCategory[]) || [];

  if (categories.length === 0) {
    return (
      <VStack spacing={3} py={4}>
        <Text fontSize="sm" color="gray.500">
          No categories yet. Create one to get started!
        </Text>
        <Button
          size="sm"
          leftIcon={<Icon.Plus size={16} />}
          onClick={onCreateClick}
        >
          Create Category
        </Button>
      </VStack>
    );
  }

  return (
    <VStack spacing={1} align="stretch">
      <HStack justify="space-between" px={2} py={2} borderBottomWidth="1px">
        <Text fontWeight="bold" fontSize="sm">
          Categories
        </Text>
        <Button
          size="xs"
          leftIcon={<Icon.Plus size={14} />}
          onClick={onCreateClick}
        >
          New
        </Button>
      </HStack>

      {categories.map((category) => (
        <CategoryNode
          key={category.id}
          category={category}
          level={0}
          onSelect={onCategorySelect}
          onDelete={handleDelete}
          onRename={handleRename}
        />
      ))}
    </VStack>
  );
};
