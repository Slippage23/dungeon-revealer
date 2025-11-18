import * as React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  useToast,
} from "@chakra-ui/react";
import {
  useCreateNoteCategory,
  useNoteCategories,
} from "./hooks/use-note-categories";

interface NoteCategory {
  id: string;
  name: string;
  children?: NoteCategory[];
}

interface NoteCategoryCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  mapId: string;
  onSuccess?: () => void;
}

/**
 * Flatten categories into a list for select dropdown
 */
const flattenCategories = (
  categories: NoteCategory[],
  prefix = ""
): { id: string; name: string }[] => {
  return categories.flatMap((cat) => {
    const result = [
      { id: cat.id, name: prefix ? `${prefix} / ${cat.name}` : cat.name },
    ];
    if (cat.children) {
      result.push(
        ...flattenCategories(
          cat.children,
          prefix ? `${prefix} / ${cat.name}` : cat.name
        )
      );
    }
    return result;
  });
};

/**
 * Modal for creating a new note category
 */
export const NoteCategoryCreateModal: React.FC<NoteCategoryCreateModalProps> =
  ({ isOpen, onClose, mapId, onSuccess }) => {
    const [name, setName] = React.useState("");
    const [parentId, setParentId] = React.useState("");
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const createCategory = useCreateNoteCategory();
    const categoriesQuery = useNoteCategories(mapId);
    const toast = useToast();

    const handleSubmit = async () => {
      if (!name.trim()) {
        toast({
          title: "Validation error",
          description: "Category name is required",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      setIsSubmitting(true);
      try {
        await createCategory({
          mapId,
          name: name.trim(),
          parentId: parentId || undefined,
          displayOrder: 0,
        });

        toast({
          title: "Category created",
          description: `"${name}" has been created.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        setName("");
        setParentId("");
        onSuccess?.();
        onClose();
      } catch (err) {
        toast({
          title: "Error creating category",
          description:
            err instanceof Error ? err.message : "Unknown error occurred",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsSubmitting(false);
      }
    };

    const categories =
      (categoriesQuery.data?.noteCategoryTree as NoteCategory[]) || [];
    const flattenedCategories = flattenCategories(categories);

    return (
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Category</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Category Name</FormLabel>
                <Input
                  placeholder="e.g., NPCs, Locations, Encounters"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSubmit();
                  }}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Parent Category (Optional)</FormLabel>
                <Select
                  placeholder="None (top level)"
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  aria-label="Parent category"
                >
                  {flattenedCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSubmit}
              isLoading={isSubmitting}
            >
              Create
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  };
