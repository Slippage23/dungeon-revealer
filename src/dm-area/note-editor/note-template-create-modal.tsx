import * as React from "react";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Textarea,
  useToast,
  VStack,
  HStack,
  Text,
} from "@chakra-ui/react";
import * as Icon from "../../feather-icons";
import { useCreateNoteTemplate } from "./hooks/use-note-templates";

export interface TemplateField {
  id: string;
  type: "text" | "number" | "textarea" | "select" | "checkbox";
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
}

const TEMPLATE_CATEGORIES = [
  "Monster",
  "NPC",
  "Location",
  "Quest",
  "Item",
  "Encounter",
  "Custom",
];

interface NoteTemplateCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  mapId: string;
  onSuccess?: () => void;
}

/**
 * Modal component for creating a new note template
 */
export const NoteTemplateCreateModal: React.FC<NoteTemplateCreateModalProps> =
  ({ isOpen, onClose, mapId, onSuccess }) => {
    const [name, setName] = React.useState("");
    const [category, setCategory] = React.useState("Custom");
    const [description, setDescription] = React.useState("");
    const [fields, setFields] = React.useState<TemplateField[]>([
      {
        id: "1",
        type: "text",
        label: "Name",
        required: true,
        placeholder: "Enter name",
      },
    ]);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const createTemplate = useCreateNoteTemplate();
    const toast = useToast();

    const handleAddField = () => {
      const newId = String(
        Math.max(...fields.map((f) => parseInt(f.id)), 0) + 1
      );
      setFields([
        ...fields,
        {
          id: newId,
          type: "text",
          label: "New Field",
          required: false,
        },
      ]);
    };

    const handleUpdateField = (id: string, updates: Partial<TemplateField>) => {
      setFields(fields.map((f) => (f.id === id ? { ...f, ...updates } : f)));
    };

    const handleRemoveField = (id: string) => {
      if (fields.length > 1) {
        setFields(fields.filter((f) => f.id !== id));
      }
    };

    const handleSubmit = async () => {
      if (!name.trim()) {
        toast({
          title: "Validation error",
          description: "Template name is required",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      try {
        setIsSubmitting(true);

        const schema = JSON.stringify(fields);

        await createTemplate({
          mapId,
          name: name.trim(),
          category,
          description: description.trim() || undefined,
          schema,
        });

        toast({
          title: "Template created",
          description: `"${name}" has been created successfully.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        // Reset form
        setName("");
        setCategory("Custom");
        setDescription("");
        setFields([
          {
            id: "1",
            type: "text",
            label: "Name",
            required: true,
            placeholder: "Enter name",
          },
        ]);

        onClose();
        onSuccess?.();
      } catch (err) {
        toast({
          title: "Error creating template",
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

    return (
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Note Template</ModalHeader>
          <ModalCloseButton isDisabled={isSubmitting} />

          <ModalBody>
            <VStack spacing={4}>
              {/* Template Name */}
              <FormControl>
                <FormLabel>Template Name</FormLabel>
                <Input
                  placeholder="e.g., Generic Monster"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  isDisabled={isSubmitting}
                />
              </FormControl>

              {/* Category */}
              <FormControl>
                <FormLabel>Category</FormLabel>
                <Select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  isDisabled={isSubmitting}
                >
                  {TEMPLATE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </Select>
              </FormControl>

              {/* Description */}
              <FormControl>
                <FormLabel>Description (optional)</FormLabel>
                <Textarea
                  placeholder="Describe what this template is for..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  isDisabled={isSubmitting}
                  rows={2}
                />
              </FormControl>

              {/* Fields Section */}
              <Box w="100%" pt={2} borderTopWidth="1px">
                <HStack justify="space-between" mb={3}>
                  <Text fontWeight="bold">Fields</Text>
                  <Button
                    size="xs"
                    leftIcon={<Icon.Plus size={14} />}
                    onClick={handleAddField}
                    isDisabled={isSubmitting}
                  >
                    Add Field
                  </Button>
                </HStack>

                <VStack spacing={3} align="stretch">
                  {fields.map((field) => (
                    <Box
                      key={field.id}
                      p={3}
                      borderWidth="1px"
                      borderRadius="md"
                      bg="gray.50"
                    >
                      <HStack spacing={2} mb={2}>
                        <FormControl flex={1}>
                          <FormLabel fontSize="xs">Field Label</FormLabel>
                          <Input
                            size="sm"
                            placeholder="e.g., Hit Points"
                            value={field.label}
                            onChange={(e) =>
                              handleUpdateField(field.id, {
                                label: e.target.value,
                              })
                            }
                            isDisabled={isSubmitting}
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel fontSize="xs">Type</FormLabel>
                          <Select
                            size="sm"
                            value={field.type}
                            onChange={(e) =>
                              handleUpdateField(field.id, {
                                type: e.target.value as TemplateField["type"],
                              })
                            }
                            isDisabled={isSubmitting}
                          >
                            <option value="text">Text</option>
                            <option value="number">Number</option>
                            <option value="textarea">Textarea</option>
                            <option value="select">Select</option>
                            <option value="checkbox">Checkbox</option>
                          </Select>
                        </FormControl>
                        {fields.length > 1 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => handleRemoveField(field.id)}
                            isDisabled={isSubmitting}
                            mt={6}
                          >
                            <Icon.X size={14} />
                          </Button>
                        )}
                      </HStack>

                      <HStack spacing={2}>
                        <FormControl flex={1}>
                          <FormLabel fontSize="xs">Placeholder</FormLabel>
                          <Input
                            size="sm"
                            placeholder="Placeholder text..."
                            value={field.placeholder || ""}
                            onChange={(e) =>
                              handleUpdateField(field.id, {
                                placeholder: e.target.value,
                              })
                            }
                            isDisabled={isSubmitting}
                          />
                        </FormControl>
                        <Checkbox
                          isChecked={field.required}
                          onChange={(e) =>
                            handleUpdateField(field.id, {
                              required: e.target.checked,
                            })
                          }
                          isDisabled={isSubmitting}
                        >
                          <FormLabel fontSize="xs" mb={0}>
                            Required
                          </FormLabel>
                        </Checkbox>
                      </HStack>
                    </Box>
                  ))}
                </VStack>
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button
              variant="ghost"
              mr={3}
              onClick={onClose}
              isDisabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSubmit}
              isLoading={isSubmitting}
            >
              Create Template
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  };
