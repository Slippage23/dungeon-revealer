import * as React from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Link,
  Badge,
  Divider,
  Button,
} from "@chakra-ui/react";
import * as Icon from "../../feather-icons";
import {
  useNoteBacklinksTo,
  useNoteBacklinksFrom,
} from "./hooks/use-note-backlinks";

export interface NoteBacklink {
  id: string;
  fromNoteId: string;
  toNoteId: string;
  linkText?: string;
}

interface NoteBacklinksPanelProps {
  noteId: string;
  onLinkClick?: (linkedNoteId: string) => void;
}

/**
 * Component to display incoming and outgoing note links
 */
export const NoteBacklinksPanel: React.FC<NoteBacklinksPanelProps> = ({
  noteId,
  onLinkClick,
}) => {
  const backlinksToQuery = useNoteBacklinksTo(noteId);
  const backlinksFromQuery = useNoteBacklinksFrom(noteId);

  const backlinksTo =
    (backlinksToQuery.data?.backlinksTo as NoteBacklink[]) || [];
  const backlinksFrom =
    (backlinksFromQuery.data?.backlinksFrom as NoteBacklink[]) || [];

  const isLoading = backlinksToQuery.isLoading || backlinksFromQuery.isLoading;
  const hasError = backlinksToQuery.error || backlinksFromQuery.error;

  if (isLoading) {
    return (
      <Box p={4}>
        <Text fontSize="sm" color="gray.500">
          Loading links...
        </Text>
      </Box>
    );
  }

  if (hasError) {
    return (
      <Box p={4}>
        <Text fontSize="sm" color="red.500">
          Error loading links
        </Text>
      </Box>
    );
  }

  const totalLinks = backlinksTo.length + backlinksFrom.length;

  if (totalLinks === 0) {
    return (
      <Box p={4}>
        <Text fontSize="sm" color="gray.500">
          No links yet. Link this note from other notes to see them here.
        </Text>
      </Box>
    );
  }

  return (
    <VStack spacing={4} align="stretch" p={4}>
      {backlinksTo.length > 0 && (
        <>
          <Box>
            <HStack spacing={2} mb={3}>
              <Icon.ChevronRight size={16} />
              <Text fontWeight="bold" fontSize="sm">
                Incoming Links ({backlinksTo.length})
              </Text>
            </HStack>

            <VStack spacing={2} align="stretch" ml={4}>
              {backlinksTo.map((backlink) => (
                <HStack key={backlink.id} spacing={2}>
                  <Icon.Link size={14} />
                  <Button
                    variant="link"
                    fontSize="sm"
                    colorScheme="blue"
                    onClick={() => onLinkClick?.(backlink.fromNoteId)}
                  >
                    {backlink.linkText ||
                      `Note ${backlink.fromNoteId.substring(0, 8)}`}
                  </Button>
                  <Badge colorScheme="gray" fontSize="xs">
                    {backlink.linkText ? "mentioned" : "linked"}
                  </Badge>
                </HStack>
              ))}
            </VStack>
          </Box>

          <Divider />
        </>
      )}

      {backlinksFrom.length > 0 && (
        <Box>
          <HStack spacing={2} mb={3}>
            <Icon.ChevronLeft size={16} />
            <Text fontWeight="bold" fontSize="sm">
              Outgoing Links ({backlinksFrom.length})
            </Text>
          </HStack>

          <VStack spacing={2} align="stretch" ml={4}>
            {backlinksFrom.map((backlink) => (
              <HStack key={backlink.id} spacing={2}>
                <Icon.Link size={14} />
                <Button
                  variant="link"
                  fontSize="sm"
                  colorScheme="blue"
                  onClick={() => onLinkClick?.(backlink.toNoteId)}
                >
                  {backlink.linkText ||
                    `Note ${backlink.toNoteId.substring(0, 8)}`}
                </Button>
                <Badge colorScheme="blue" fontSize="xs">
                  {backlink.linkText ? "mentioned" : "linked"}
                </Badge>
              </HStack>
            ))}
          </VStack>
        </Box>
      )}
    </VStack>
  );
};
