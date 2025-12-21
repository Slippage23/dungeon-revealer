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
  Checkbox,
  Progress,
} from "@chakra-ui/react";
import graphql from "babel-plugin-relay/macro";
import { useQuery, useMutation } from "relay-hooks";
import { notesTab_NotesQuery } from "./__generated__/notesTab_NotesQuery.graphql";
import { notesTab_NoteDeleteMutation } from "./__generated__/notesTab_NoteDeleteMutation.graphql";
import { notesTab_NoteCreateMutation } from "./__generated__/notesTab_NoteCreateMutation.graphql";
import { useAccessToken } from "../../hooks/use-access-token";
import { buildApiUrl } from "../../public-url";

const COLORS = {
  // New warm cream palette
  cardBg: "#f5ead8",
  cardBgEnd: "#e8d4b0",
  border: "#3a2f26",
  text: "#3a2f26",
  textLight: "#5a4d3e",
  accent: "#8b4513",
  success: "#228b22",
  // Backward compatibility aliases
  burgundy: "#3a2f26",
  burgundyDark: "#2d241c",
  tan: "#8b4513",
  tanLight: "#3a2f26",
  contentBg: "#f5ead8",
};

const PageTitle = styled.h1`
  font-size: 36px;
  font-weight: bold;
  color: ${COLORS.text};
  margin-bottom: 24px;
  font-family: folkard, Georgia, serif;
  text-transform: uppercase;
  letter-spacing: 2px;
`;

const ActionBar = styled(HStack)`
  background: linear-gradient(
    180deg,
    ${COLORS.cardBg} 0%,
    ${COLORS.cardBgEnd} 100%
  );
  border: 3px solid ${COLORS.border};
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
`;

const UploadButton = styled(Button)`
  background-color: ${COLORS.accent} !important;
  color: #fff !important;
  border: 2px solid ${COLORS.border} !important;
  border-radius: 6px;
  text-transform: uppercase;
  font-size: 14px;
  font-weight: bold;
  font-family: Georgia, "Times New Roman", serif;
  padding: 10px 16px;

  &:hover {
    background-color: ${COLORS.border} !important;
  }
`;

const StyledTable = styled(TableContainer)`
  border: 3px solid ${COLORS.border};
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);

  table {
    background: linear-gradient(
      180deg,
      ${COLORS.cardBg} 0%,
      ${COLORS.cardBgEnd} 100%
    );
  }

  thead {
    background-color: ${COLORS.border};
  }

  th {
    color: ${COLORS.cardBg};
    border-color: ${COLORS.border};
    font-family: Georgia, "Times New Roman", serif;
    font-weight: bold;
    text-transform: uppercase;
    font-size: 14px;
  }

  td {
    color: ${COLORS.text};
    border-color: ${COLORS.border};
    font-size: 15px;
    font-family: Georgia, "Times New Roman", serif;
  }

  tbody tr:hover {
    background-color: ${COLORS.cardBgEnd};
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

const noteCreateMutation = graphql`
  mutation notesTab_NoteCreateMutation($input: NoteCreateInput!) {
    noteCreate(input: $input) {
      note {
        id
        title
      }
    }
  }
`;

type MonsterData = {
  name: string;
  data: Record<string, unknown>;
  selected: boolean;
};

export const NotesTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isImporting, setIsImporting] = React.useState(false);
  const [selectedNote, setSelectedNote] = React.useState<{
    id: string;
    title: string;
    content?: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const mdFileInputRef = React.useRef<HTMLInputElement>(null);
  const excelFileInputRef = React.useRef<HTMLInputElement>(null);
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const toast = useToast();
  const accessToken = useAccessToken();

  // XLSX Monster Import State
  const [monsters, setMonsters] = React.useState<MonsterData[]>([]);
  const [isParsing, setIsParsing] = React.useState(false);
  const [isCreatingNotes, setIsCreatingNotes] = React.useState(false);
  const [importProgress, setImportProgress] = React.useState(0);
  const {
    isOpen: isMonsterModalOpen,
    onOpen: onMonsterModalOpen,
    onClose: onMonsterModalClose,
  } = useDisclosure();

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
  const [noteCreate] =
    useMutation<notesTab_NoteCreateMutation>(noteCreateMutation);

  // Parse monsters from browser-uploaded Excel file
  const handleExcelFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so same file can be selected again
    e.target.value = "";

    setIsParsing(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        buildApiUrl("/manager/parse-monsters-browser"),
        {
          method: "POST",
          headers: {
            Authorization: accessToken ? `Bearer ${accessToken}` : "",
          },
          body: formData,
        }
      );
      const json = await response.json();
      if (json.error) {
        throw new Error(json.error.message);
      }
      const parsed: MonsterData[] = (json.data?.monsters || []).map(
        (m: { name: string; data: Record<string, unknown> }) => ({
          ...m,
          selected: true,
        })
      );
      setMonsters(parsed);
      if (parsed.length === 0) {
        toast({
          title: "No monsters found",
          description: "The Excel file contained no valid monster data",
          status: "warning",
          duration: 4000,
        });
      } else {
        onMonsterModalOpen();
      }
    } catch (err: any) {
      toast({
        title: "Parse failed",
        description: err.message,
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsParsing(false);
    }
  };

  // Toggle monster selection
  const toggleMonsterSelection = (index: number) => {
    setMonsters((prev) =>
      prev.map((m, i) => (i === index ? { ...m, selected: !m.selected } : m))
    );
  };

  // Select/deselect all monsters
  const toggleAllMonsters = (selected: boolean) => {
    setMonsters((prev) => prev.map((m) => ({ ...m, selected })));
  };

  // Format monster data as markdown content
  const formatMonsterContent = (monster: MonsterData): string => {
    const lines: string[] = [`# ${monster.name}`, ""];
    const data = monster.data;
    for (const [key, value] of Object.entries(data)) {
      if (
        key.toLowerCase() !== "name" &&
        key.toLowerCase() !== "monster name"
      ) {
        lines.push(`**${key}:** ${value}`);
      }
    }
    return lines.join("\n");
  };

  // Create notes from selected monsters
  const handleCreateNotesFromMonsters = async () => {
    const selectedMonsters = monsters.filter((m) => m.selected);
    if (selectedMonsters.length === 0) {
      toast({
        title: "No monsters selected",
        description: "Select at least one monster to import",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    setIsCreatingNotes(true);
    setImportProgress(0);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < selectedMonsters.length; i++) {
      const monster = selectedMonsters[i];
      try {
        await noteCreate({
          variables: {
            input: {
              title: monster.name,
              content: formatMonsterContent(monster),
              isEntryPoint: false,
            },
          },
        });
        successCount++;
      } catch (err) {
        console.error(`Failed to create note for ${monster.name}:`, err);
        failCount++;
      }
      setImportProgress(((i + 1) / selectedMonsters.length) * 100);
    }

    toast({
      title: "Import complete",
      description: `Created ${successCount} notes, ${failCount} failed`,
      status: failCount === 0 ? "success" : "warning",
      duration: 5000,
    });

    setIsCreatingNotes(false);
    setImportProgress(0);
    onMonsterModalClose();
    setMonsters([]);
    retry(); // Refresh notes list
  };

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

  // Handle markdown/zip file import with FormData (supports multiple files)
  const handleMdFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Reset input so same files can be selected again
    event.target.value = "";

    setIsImporting(true);

    let totalImported = 0;
    let totalFailed = 0;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validate file type
        const validExtensions = [".md", ".zip"];
        const isValid = validExtensions.some((ext) =>
          file.name.toLowerCase().endsWith(ext)
        );
        if (!isValid) {
          totalFailed++;
          continue;
        }

        // Use FormData to send file (busboy expects multipart/form-data)
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(buildApiUrl("/notes/import"), {
          method: "POST",
          headers: {
            Authorization: accessToken ? `Bearer ${accessToken}` : "",
          },
          body: formData,
        });

        if (!response.ok) {
          totalFailed++;
          continue;
        }

        const text = await response.text();
        // Parse the last line of the response (streaming response)
        const lines = text.trim().split("\n");
        const lastLine = lines[lines.length - 1];
        if (lastLine) {
          try {
            const result = JSON.parse(lastLine);
            totalImported += result.amountOfImportedRecords || 0;
            totalFailed += result.amountOfFailedRecords || 0;
          } catch {
            totalFailed++;
          }
        }
      }

      toast({
        title: "Import complete",
        description: `Imported ${totalImported} notes, ${totalFailed} failed`,
        status: totalFailed === 0 ? "success" : "warning",
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
          Import monsters from Excel or markdown files
        </Text>
      </Box>

      {/* Hidden file inputs */}
      <input
        type="file"
        ref={mdFileInputRef}
        style={{ display: "none" }}
        accept=".md,.zip"
        multiple
        onChange={handleMdFileSelect}
      />
      <input
        type="file"
        ref={excelFileInputRef}
        style={{ display: "none" }}
        accept=".xlsx,.xls"
        onChange={handleExcelFileSelect}
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
            onClick={() => mdFileInputRef.current?.click()}
            isLoading={isImporting}
            loadingText="Importing..."
          >
            📄 Import Notes (.md/.zip)
          </UploadButton>
          <UploadButton
            size="sm"
            onClick={() => excelFileInputRef.current?.click()}
            isLoading={isParsing}
            loadingText="Parsing..."
          >
            📊 Import Monsters (.xlsx)
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
              Import monsters from an Excel file or markdown notes to get
              started
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

      {/* Monster Import Modal */}
      <Modal
        isOpen={isMonsterModalOpen}
        onClose={onMonsterModalClose}
        size="xl"
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent bg="#454545" borderColor={COLORS.burgundy} maxH="80vh">
          <ModalHeader color={COLORS.tanLight}>
            Import Monsters from Excel
          </ModalHeader>
          <ModalCloseButton color={COLORS.textLight} />
          <ModalBody>
            {isCreatingNotes && (
              <Box mb={4}>
                <Text color={COLORS.textLight} mb={2}>
                  Creating notes... {Math.round(importProgress)}%
                </Text>
                <Progress
                  value={importProgress}
                  size="sm"
                  colorScheme="green"
                  borderRadius="4px"
                />
              </Box>
            )}
            <HStack mb={4} justify="space-between">
              <Text color={COLORS.textLight} fontSize="14px">
                {monsters.filter((m) => m.selected).length} of {monsters.length}{" "}
                monsters selected
              </Text>
              <HStack spacing={2}>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => toggleAllMonsters(true)}
                >
                  Select All
                </Button>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => toggleAllMonsters(false)}
                >
                  Deselect All
                </Button>
              </HStack>
            </HStack>
            <StyledTable>
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th width="50px">Select</Th>
                    <Th>Monster Name</Th>
                    <Th>Data Fields</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {monsters.map((monster, index) => (
                    <Tr key={index}>
                      <Td>
                        <Checkbox
                          isChecked={monster.selected}
                          onChange={() => toggleMonsterSelection(index)}
                          colorScheme="green"
                        />
                      </Td>
                      <Td fontWeight="bold">{monster.name}</Td>
                      <Td fontSize="12px" opacity={0.8}>
                        {Object.keys(monster.data).slice(0, 5).join(", ")}
                        {Object.keys(monster.data).length > 5 && "..."}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </StyledTable>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="ghost"
              mr={3}
              onClick={onMonsterModalClose}
              isDisabled={isCreatingNotes}
            >
              Cancel
            </Button>
            <UploadButton
              onClick={handleCreateNotesFromMonsters}
              isLoading={isCreatingNotes}
              loadingText="Creating Notes..."
              isDisabled={monsters.filter((m) => m.selected).length === 0}
            >
              Create Notes ({monsters.filter((m) => m.selected).length})
            </UploadButton>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};
