import * as React from "react";
import styled from "@emotion/styled/macro";
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Spinner,
  Center,
  Input,
  Table,
  Tbody,
  Tr,
  Td,
  Thead,
  Th,
  TableContainer,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import graphql from "babel-plugin-relay/macro";
import { useQuery, useMutation } from "relay-hooks";
import { notesTab_NotesQuery } from "./__generated__/notesTab_NotesQuery.graphql";
import { notesTab_NoteDeleteMutation } from "./__generated__/notesTab_NoteDeleteMutation.graphql";
import { useAccessToken } from "../../hooks/use-access-token";
import { buildApiUrl } from "../../public-url";

const COLORS = {
  burgundy: "#8B3A3A",
  burgundyDark: "#5C2323",
  tan: "#D4C4B9",
  tanLight: "#E8DCD2",
  contentBg: "#3A3A3A",
  textLight: "#E8DCD2",
  border: "#5C2323",
};

const PageTitle = styled.h1`
  font-size: 32px;
  font-weight: bold;
  color: ${COLORS.tanLight};
  margin-bottom: 24px;
  font-family: Georgia, serif;
  text-transform: uppercase;
  letter-spacing: 2px;
`;

const ActionBar = styled(HStack)`
  background-color: #454545;
  border: 1px solid ${COLORS.burgundy};
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 24px;
`;

const UploadButton = styled(Button)`
  background-color: ${COLORS.burgundy} !important;
  color: ${COLORS.tanLight} !important;
  border: 1px solid ${COLORS.tan} !important;
  text-transform: uppercase;
  font-size: 12px;
  font-weight: bold;

  &:hover {
    background-color: ${COLORS.burgundyDark} !important;
  }
`;

const StyledTable = styled(TableContainer)`
  border: 1px solid ${COLORS.burgundy};
  border-radius: 4px;
  overflow: hidden;

  table {
    background-color: #454545;
  }

  thead {
    background-color: ${COLORS.burgundy};
  }

  th {
    color: ${COLORS.tanLight};
    border-color: ${COLORS.border};
    font-family: Georgia, serif;
    font-weight: bold;
    text-transform: uppercase;
    font-size: 12px;
  }

  td {
    color: ${COLORS.textLight};
    border-color: ${COLORS.border};
    font-size: 13px;
  }

  tbody tr:hover {
    background-color: #505050;
  }
`;

const notesQuery = graphql`
  query notesTab_NotesQuery($first: Int, $after: String) {
    notes(first: $first, after: $after, filter: All) {
      edges {
        node {
          id
          title
          content
          createdAt
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

const noteDeleteMutation = graphql`
  mutation notesTab_NoteDeleteMutation($input: NoteDeleteInput!) {
    noteDelete(input: $input) {
      success
      deletedNoteId
    }
  }
`;

export const NotesTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isImporting, setIsImporting] = React.useState(false);
  const [selectedNote, setSelectedNote] = React.useState<{
    id: string;
    title: string;
    content?: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const toast = useToast();
  const accessToken = useAccessToken();

  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const {
    isOpen: isViewOpen,
    onOpen: onViewOpen,
    onClose: onViewClose,
  } = useDisclosure();

  const { data, isLoading, error, retry } = useQuery<notesTab_NotesQuery>(
    notesQuery,
    {
      first: 50,
    }
  );

  const [noteDelete] =
    useMutation<notesTab_NoteDeleteMutation>(noteDeleteMutation);

  const handleDeleteClick = (note: { id: string; title: string }) => {
    setSelectedNote(note);
    onDeleteOpen();
  };

  const handleViewClick = (note: {
    id: string;
    title: string;
    content?: string;
  }) => {
    setSelectedNote(note);
    onViewOpen();
  };

  const handleDeleteConfirm = async () => {
    if (!selectedNote) return;
    setIsDeleting(true);
    try {
      await noteDelete({
        variables: {
          input: { noteId: selectedNote.id },
        },
      });
      toast({
        title: "Note deleted",
        description: `Deleted note: ${selectedNote.title}`,
        status: "success",
        duration: 3000,
      });
      retry();
      onDeleteClose();
    } catch (err: any) {
      toast({
        title: "Delete failed",
        description: err.message,
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsDeleting(false);
      setSelectedNote(null);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validExtensions = [".md", ".zip"];
    const isValid = validExtensions.some((ext) =>
      file.name.toLowerCase().endsWith(ext)
    );
    if (!isValid) {
      toast({
        title: "Invalid file type",
        description: "Please select a .md or .zip file",
        status: "error",
        duration: 3000,
      });
      return;
    }

    setIsImporting(true);

    try {
      const response = await fetch(buildApiUrl("/notes/import"), {
        method: "POST",
        headers: {
          Authorization: accessToken ? `Bearer ${accessToken}` : "",
          "Content-Type": "application/octet-stream",
        },
        body: file,
      });

      if (!response.ok) {
        throw new Error(`Import failed: ${response.statusText}`);
      }

      const text = await response.text();
      // Parse the last line of the response (streaming response)
      const lines = text.trim().split("\n");
      const lastLine = lines[lines.length - 1];
      const result = JSON.parse(lastLine);

      toast({
        title: "Import complete",
        description: `Imported ${result.amountOfImportedRecords} notes, ${result.amountOfFailedRecords} failed`,
        status: result.amountOfFailedRecords === 0 ? "success" : "warning",
        duration: 5000,
      });

      // Refresh the list
      retry();
    } catch (err) {
      console.error("Notes import failed:", err);
      toast({
        title: "Import failed",
        description: err instanceof Error ? err.message : "Unknown error",
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const notes = data?.notes?.edges?.map((edge) => edge.node) || [];
  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <Center height="300px">
        <Spinner size="xl" color={COLORS.tan} />
      </Center>
    );
  }

  if (error) {
    return (
      <Box color="red.400" p={6}>
        <Text>Error loading notes: {error.message}</Text>
      </Box>
    );
  }

  return (
    <VStack align="stretch" spacing={6}>
      <Box>
        <PageTitle>📝 Notes & Monsters</PageTitle>
        <Text color={COLORS.textLight} fontSize="14px">
          Import monsters from Excel, manage shared resource notes
        </Text>
      </Box>

      {/* Hidden file input for import */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept=".md,.zip"
        onChange={handleFileSelect}
      />

      {/* Action Bar */}
      <ActionBar justifyContent="space-between" width="100%">
        <Input
          placeholder="Search notes by title..."
          bg={COLORS.contentBg}
          borderColor={COLORS.burgundy}
          color={COLORS.textLight}
          size="sm"
          width="300px"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          _placeholder={{ color: COLORS.textLight, opacity: 0.5 }}
        />

        <HStack spacing={2}>
          <UploadButton
            size="sm"
            onClick={handleImportClick}
            isLoading={isImporting}
            loadingText="Importing..."
          >
            📊 Import Notes
          </UploadButton>
        </HStack>
      </ActionBar>

      {/* Notes Table */}
      {filteredNotes.length === 0 ? (
        <Center p={12}>
          <VStack spacing={4}>
            <Text fontSize="18px" color={COLORS.textLight}>
              {searchTerm ? "No notes match your search" : "No notes yet"}
            </Text>
            <Text fontSize="12px" color={COLORS.textLight} opacity={0.6}>
              Import monsters from an Excel file to get started
            </Text>
          </VStack>
        </Center>
      ) : (
        <StyledTable>
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>Title</Th>
                <Th>Created</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredNotes.map((note) => (
                <Tr key={note.id}>
                  <Td maxW="300px" isTruncated>
                    {note.title}
                  </Td>
                  <Td>{new Date(note.createdAt).toLocaleDateString()}</Td>
                  <Td>
                    <HStack spacing={2}>
                      <Button
                        size="xs"
                        variant="outline"
                        fontSize="11px"
                        onClick={() =>
                          handleViewClick({
                            id: note.id,
                            title: note.title,
                            content: note.content,
                          })
                        }
                      >
                        View
                      </Button>
                      <Button
                        size="xs"
                        variant="outline"
                        colorScheme="red"
                        fontSize="11px"
                        onClick={() =>
                          handleDeleteClick({
                            id: note.id,
                            title: note.title,
                          })
                        }
                      >
                        Delete
                      </Button>
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </StyledTable>
      )}

      {/* Import Guide */}
      <Box
        bg={COLORS.contentBg}
        border={`1px solid ${COLORS.burgundy}`}
        borderRadius="4px"
        p={6}
        mt={8}
      >
        <Text
          fontSize="16px"
          fontWeight="bold"
          color={COLORS.tan}
          mb={4}
          fontFamily="Georgia, serif"
          textTransform="uppercase"
          letterSpacing="1px"
        >
          📖 Import Guide
        </Text>
        <VStack
          align="start"
          spacing={3}
          fontSize="13px"
          color={COLORS.textLight}
        >
          <Text>
            <strong>Excel Format:</strong> Your file should have columns like
            Name, AC, HP, etc.
          </Text>
          <Text>
            <strong>Fuzzy Matching:</strong> Monster names are matched against
            available tokens
          </Text>
          <Text>
            <strong>Linking:</strong> Matched tokens are automatically linked to
            created notes
          </Text>
          <Text>
            <strong>Batch Import:</strong> Upload multiple monsters at once with
            progress tracking
          </Text>
        </VStack>
      </Box>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent bg="#454545" borderColor={COLORS.burgundy}>
            <AlertDialogHeader color={COLORS.tanLight}>
              Delete Note
            </AlertDialogHeader>
            <AlertDialogBody color={COLORS.textLight}>
              Are you sure you want to delete "{selectedNote?.title}"? This
              action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={handleDeleteConfirm}
                ml={3}
                isLoading={isDeleting}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* View Note Modal */}
      <Modal isOpen={isViewOpen} onClose={onViewClose} size="xl">
        <ModalOverlay />
        <ModalContent bg="#454545" borderColor={COLORS.burgundy} maxH="80vh">
          <ModalHeader color={COLORS.tanLight}>
            {selectedNote?.title}
          </ModalHeader>
          <ModalCloseButton color={COLORS.textLight} />
          <ModalBody overflowY="auto">
            <Box
              color={COLORS.textLight}
              whiteSpace="pre-wrap"
              fontFamily="monospace"
              fontSize="13px"
              bg={COLORS.contentBg}
              p={4}
              borderRadius="4px"
              maxH="60vh"
              overflowY="auto"
            >
              {selectedNote?.content || "No content"}
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onViewClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};
