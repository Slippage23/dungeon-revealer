import * as React from "react";
import styled from "@emotion/styled/macro";
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  SimpleGrid,
  Spinner,
  Center,
  Input,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Checkbox,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
} from "@chakra-ui/react";
import graphql from "babel-plugin-relay/macro";
import { useQuery, useMutation } from "relay-hooks";
import { mapsTab_MapsQuery } from "./__generated__/mapsTab_MapsQuery.graphql";
import { mapsTab_MapDeleteMutation } from "./__generated__/mapsTab_MapDeleteMutation.graphql";
import { mapsTab_MapUpdateTitleMutation } from "./__generated__/mapsTab_MapUpdateTitleMutation.graphql";
import { buildApiUrl } from "../../public-url";
import { useAccessToken } from "../../hooks/use-access-token";

// Types for duplicate handling
type DuplicateInfo = {
  fileName: string;
  existingMapId: string;
  existingMapTitle: string;
  action: "skip" | "replace" | "rename";
};

type PendingUpload = {
  file: File;
  duplicateOf?: { id: string; title: string };
};

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

const MapCard = styled(Box)`
  background: linear-gradient(
    180deg,
    ${COLORS.cardBg} 0%,
    ${COLORS.cardBgEnd} 100%
  );
  border: 3px solid ${COLORS.border};
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s ease;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);

  &:hover {
    border-color: ${COLORS.accent};
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.6),
      inset 0 1px 0 rgba(255, 255, 255, 0.5);
  }
`;

const MapImage = styled.div`
  width: 100%;
  height: 150px;
  background-color: ${COLORS.cardBgEnd};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${COLORS.textLight};
  font-size: 12px;
  border-bottom: 2px solid ${COLORS.border};
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const MapInfo = styled(Box)`
  padding: 12px;
`;

const MapTitle = styled.div`
  font-size: 16px;
  font-weight: bold;
  color: ${COLORS.text};
  margin-bottom: 4px;
  font-family: Georgia, "Times New Roman", serif;
`;

const MapMeta = styled.div`
  font-size: 14px;
  color: ${COLORS.textLight};
  margin-bottom: 8px;
  font-family: Georgia, "Times New Roman", serif;
`;

const mapsQuery = graphql`
  query mapsTab_MapsQuery($first: Int, $after: String, $titleNeedle: String) {
    maps(first: $first, after: $after, titleNeedle: $titleNeedle) {
      edges {
        node {
          id
          title
          mapImageUrl
          grid {
            offsetX
            offsetY
            columnWidth
            columnHeight
          }
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
    mapsCount(titleNeedle: $titleNeedle)
  }
`;

const mapDeleteMutation = graphql`
  mutation mapsTab_MapDeleteMutation($input: MapDeleteInput!) {
    mapDelete(input: $input)
  }
`;

const mapUpdateTitleMutation = graphql`
  mutation mapsTab_MapUpdateTitleMutation($input: MapUpdateTitleInput!) {
    mapUpdateTitle(input: $input) {
      updatedMap {
        id
        title
      }
    }
  }
`;

export const MapsTab: React.FC = () => {
  const [isUploadingBrowser, setIsUploadingBrowser] = React.useState(false);
  const accessToken = useAccessToken();
  const bulkFileInputRef = React.useRef<HTMLInputElement>(null);

  // Duplicate handling state
  const [pendingUploads, setPendingUploads] = React.useState<PendingUpload[]>(
    []
  );
  const [duplicateActions, setDuplicateActions] = React.useState<
    Map<string, "skip" | "replace" | "rename">
  >(new Map());
  const {
    isOpen: isDuplicateModalOpen,
    onOpen: onDuplicateModalOpen,
    onClose: onDuplicateModalClose,
  } = useDisclosure();

  // Sorting state
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">(
    "asc"
  );

  // Server fetch limit - fetch up to 20000 at a time
  const serverFetchLimit = 20000;

  // Helper to get map title from filename (removes extension)
  const getMapTitleFromFile = (file: File): string => {
    return file.name.replace(/\.[^/.]+$/, "");
  };

  // Check for duplicates and handle upload
  const handleBrowserBulkUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Reset input so same files can be selected again
    const fileList = Array.from(files);
    e.target.value = "";

    // Get existing map titles for duplicate detection
    const existingMaps = data?.maps?.edges || [];
    const existingTitles = new Map(
      existingMaps.map((edge) => [edge.node.title.toLowerCase(), edge.node])
    );

    // Check each file for duplicates
    const uploads: PendingUpload[] = fileList.map((file) => {
      const title = getMapTitleFromFile(file);
      const existing = existingTitles.get(title.toLowerCase());
      return {
        file,
        duplicateOf: existing
          ? { id: existing.id, title: existing.title }
          : undefined,
      };
    });

    const duplicates = uploads.filter((u) => u.duplicateOf);

    if (duplicates.length > 0) {
      // Initialize all duplicates to "skip" by default
      const actions = new Map<string, "skip" | "replace" | "rename">();
      duplicates.forEach((d) => actions.set(d.file.name, "skip"));
      setDuplicateActions(actions);
      setPendingUploads(uploads);
      onDuplicateModalOpen();
    } else {
      // No duplicates, upload directly
      await performUpload(uploads, new Map());
    }
  };

  // Perform the actual upload with duplicate handling
  const performUpload = async (
    uploads: PendingUpload[],
    actions: Map<string, "skip" | "replace" | "rename">
  ) => {
    const filesToUpload: File[] = [];
    const replaceIds: string[] = [];
    const renameFiles: string[] = [];

    for (const upload of uploads) {
      if (upload.duplicateOf) {
        const action = actions.get(upload.file.name) || "skip";
        if (action === "skip") continue;
        if (action === "replace") {
          filesToUpload.push(upload.file);
          replaceIds.push(upload.duplicateOf.id);
        } else if (action === "rename") {
          filesToUpload.push(upload.file);
          renameFiles.push(upload.file.name);
        }
      } else {
        filesToUpload.push(upload.file);
      }
    }

    if (filesToUpload.length === 0) {
      toast({
        title: "No maps to upload",
        description: "All duplicates were skipped",
        status: "info",
        duration: 3000,
      });
      return;
    }

    const formData = new FormData();
    for (const file of filesToUpload) {
      formData.append("files", file);
    }
    // Pass replace IDs and rename flags to backend
    formData.append("replaceIds", JSON.stringify(replaceIds));
    formData.append("renameFiles", JSON.stringify(renameFiles));

    setIsUploadingBrowser(true);
    try {
      const res = await fetch(buildApiUrl("/manager/upload-maps-browser"), {
        method: "POST",
        headers: {
          Authorization: accessToken ? `Bearer ${accessToken}` : "",
        },
        body: formData,
      });
      const json = await res.json();
      if (json.error && !json.data) throw new Error(json.error.message);

      const imported = json.data?.imported || 0;
      const replaced = json.data?.replaced || 0;
      const renamed = json.data?.renamed || 0;
      const errors = json.data?.errors || [];

      let description = `Imported ${imported} maps`;
      if (replaced > 0) description += `, replaced ${replaced}`;
      if (renamed > 0) description += `, renamed ${renamed}`;

      if (errors.length > 0) {
        toast({
          title: "Partial upload",
          description: `${description}. ${errors.length} failed.`,
          status: "warning",
          duration: 5000,
        });
      } else {
        toast({
          title: "Upload complete",
          description,
          status: "success",
          duration: 4000,
        });
      }
      // Refresh maps list
      retry();
    } catch (err: any) {
      toast({
        title: "Browser upload failed",
        description: err.message,
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsUploadingBrowser(false);
    }
  };

  // Handle duplicate modal confirmation
  const handleDuplicateConfirm = async () => {
    onDuplicateModalClose();
    await performUpload(pendingUploads, duplicateActions);
    setPendingUploads([]);
    setDuplicateActions(new Map());
  };

  // Handle duplicate modal cancel
  const handleDuplicateCancel = () => {
    onDuplicateModalClose();
    setPendingUploads([]);
    setDuplicateActions(new Map());
  };

  // Update action for a specific file
  const setDuplicateAction = (
    fileName: string,
    action: "skip" | "replace" | "rename"
  ) => {
    setDuplicateActions((prev) => {
      const next = new Map(prev);
      next.set(fileName, action);
      return next;
    });
  };

  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedMap, setSelectedMap] = React.useState<{
    id: string;
    title: string;
  } | null>(null);
  const [editTitle, setEditTitle] = React.useState("");
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [isResettingFog, setIsResettingFog] = React.useState(false);
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const cancelFogRef = React.useRef<HTMLButtonElement>(null);
  const toast = useToast();

  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();
  const {
    isOpen: isResetFogOpen,
    onOpen: onResetFogOpen,
    onClose: onResetFogClose,
  } = useDisclosure();

  // Image preview modal state
  const {
    isOpen: isPreviewOpen,
    onOpen: onPreviewOpen,
    onClose: onPreviewClose,
  } = useDisclosure();
  const [previewMap, setPreviewMap] = React.useState<{
    id: string;
    title: string;
    url: string;
  } | null>(null);

  const { data, isLoading, error, retry } = useQuery<mapsTab_MapsQuery>(
    mapsQuery,
    {
      first: serverFetchLimit,
      after: undefined,
      titleNeedle: searchTerm || undefined,
    }
  );

  const [mapDelete] = useMutation<mapsTab_MapDeleteMutation>(mapDeleteMutation);
  const [mapUpdateTitle] = useMutation<mapsTab_MapUpdateTitleMutation>(
    mapUpdateTitleMutation
  );

  const handleDeleteClick = (map: { id: string; title: string }) => {
    setSelectedMap(map);
    onDeleteOpen();
  };

  const handleEditClick = (map: { id: string; title: string }) => {
    setSelectedMap(map);
    setEditTitle(map.title);
    onEditOpen();
  };

  const handleResetFogClick = (map: { id: string; title: string }) => {
    setSelectedMap(map);
    onResetFogOpen();
  };

  const handleResetFogConfirm = async () => {
    if (!selectedMap) return;
    setIsResettingFog(true);
    try {
      // Extract the actual map ID from the Relay global ID (format: base64("01:Map:actualId"))
      const decodedId = atob(selectedMap.id);
      const parts = decodedId.split(":");
      const actualMapId = parts.length === 3 ? parts[2] : selectedMap.id;

      const response = await fetch(`/api/map/${actualMapId}/fog`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP ${response.status}`);
      }
      toast({
        title: "Fog reset",
        description: `Reset fog for map: ${selectedMap.title}`,
        status: "success",
        duration: 3000,
      });
      onResetFogClose();
    } catch (err: any) {
      toast({
        title: "Reset fog failed",
        description: err.message,
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsResettingFog(false);
      setSelectedMap(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedMap) return;
    setIsDeleting(true);
    try {
      await mapDelete({
        variables: {
          input: { mapId: selectedMap.id },
        },
      });
      toast({
        title: "Map deleted",
        description: `Deleted map: ${selectedMap.title}`,
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
      setSelectedMap(null);
    }
  };

  const handleEditSave = async () => {
    if (!selectedMap || !editTitle.trim()) return;
    setIsUpdating(true);
    try {
      await mapUpdateTitle({
        variables: {
          input: { mapId: selectedMap.id, newTitle: editTitle.trim() },
        },
      });
      toast({
        title: "Map updated",
        description: `Renamed to: ${editTitle.trim()}`,
        status: "success",
        duration: 3000,
      });
      retry();
      onEditClose();
    } catch (err: any) {
      toast({
        title: "Update failed",
        description: err.message,
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsUpdating(false);
      setSelectedMap(null);
    }
  };

  const maps = data?.maps?.edges || [];
  const totalCount = data?.mapsCount ?? maps.length;

  // Debug: Check for duplicate titles (same name, different IDs)
  React.useEffect(() => {
    const titles = maps.map((e) => e.node.title);
    const titleCounts = titles.reduce((acc, title) => {
      acc[title] = (acc[title] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const duplicateTitles = Object.entries(titleCounts)
      .filter(([_, count]) => count > 1)
      .map(([title, count]) => `"${title}" (${count}x)`);

    if (duplicateTitles.length > 0) {
      console.warn("[Maps Tab] DUPLICATE TITLES:", duplicateTitles.join(", "));
    } else {
      console.log("[Maps Tab] All titles unique:", titles.length, "maps");
    }
  }, [maps]);

  // Sort maps client-side (server returns in creation order)
  const sortedMaps = React.useMemo(() => {
    return [...maps].sort((a, b) => {
      const comparison = a.node.title.localeCompare(b.node.title);
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [maps, sortDirection]);

  // Client-side pagination for display (24 items per page)
  const displayItemsPerPage = 24;
  const [displayPage, setDisplayPage] = React.useState(1);
  const totalDisplayPages = Math.ceil(sortedMaps.length / displayItemsPerPage);
  const paginatedMaps = sortedMaps.slice(
    (displayPage - 1) * displayItemsPerPage,
    displayPage * displayItemsPerPage
  );

  // Reset display page when data changes
  React.useEffect(() => {
    setDisplayPage(1);
  }, [searchTerm, maps.length]);

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
        <Text>Error loading maps: {error.message}</Text>
      </Box>
    );
  }

  return (
    <VStack align="stretch" spacing={6}>
      <Box>
        <PageTitle>🗺️ Maps Management</PageTitle>
        <Text color={COLORS.textLight} fontSize="14px">
          Upload, manage, and organize your campaign maps
        </Text>
      </Box>

      {/* Action Bar */}
      <ActionBar justifyContent="space-between" width="100%">
        <HStack spacing={4}>
          <Input
            placeholder="Search maps by title..."
            bg={COLORS.contentBg}
            borderColor={COLORS.burgundy}
            color={COLORS.textLight}
            size="sm"
            width="300px"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            _placeholder={{ color: COLORS.textLight, opacity: 0.5 }}
          />
          <Button
            size="sm"
            variant="outline"
            borderColor={COLORS.border}
            color={COLORS.text}
            onClick={() =>
              setSortDirection(sortDirection === "asc" ? "desc" : "asc")
            }
            _hover={{ bg: COLORS.cardBgEnd }}
          >
            Sort: {sortDirection === "asc" ? "A→Z ▲" : "Z→A ▼"}
          </Button>
        </HStack>

        <HStack spacing={2}>
          <input
            type="file"
            ref={bulkFileInputRef}
            style={{ display: "none" }}
            accept="image/png,image/jpeg,image/gif,image/webp"
            multiple
            onChange={handleBrowserBulkUpload}
          />
          <UploadButton
            size="sm"
            onClick={() => bulkFileInputRef.current?.click()}
            isLoading={isUploadingBrowser}
            loadingText="Uploading..."
          >
            📤 Upload Maps
          </UploadButton>
        </HStack>
      </ActionBar>

      {/* Maps Grid */}
      {paginatedMaps.length === 0 ? (
        <Center p={12}>
          <VStack spacing={4}>
            <Text fontSize="18px" color={COLORS.textLight}>
              {searchTerm ? "No maps match your search" : "No maps yet"}
            </Text>
            <Text fontSize="12px" color={COLORS.textLight} opacity={0.6}>
              Upload a map to get started
            </Text>
          </VStack>
        </Center>
      ) : (
        <>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={4}>
            {paginatedMaps.map((edge) => (
              <MapCard key={edge.node.id}>
                <MapImage
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setPreviewMap({
                      id: edge.node.id,
                      title: edge.node.title,
                      url: edge.node.mapImageUrl || "",
                    });
                    onPreviewOpen();
                  }}
                >
                  {edge.node.mapImageUrl ? (
                    <img src={edge.node.mapImageUrl} alt={edge.node.title} />
                  ) : (
                    <Text>No image</Text>
                  )}
                </MapImage>
                <MapInfo>
                  <MapTitle>{edge.node.title}</MapTitle>
                  <MapMeta>
                    Grid: {edge.node.grid?.columnWidth || "1.0"}x
                  </MapMeta>
                  <HStack spacing={2} mt={3}>
                    <Button
                      size="xs"
                      variant="outline"
                      colorScheme="red"
                      fontSize="11px"
                      onClick={() =>
                        handleDeleteClick({
                          id: edge.node.id,
                          title: edge.node.title,
                        })
                      }
                    >
                      Delete
                    </Button>
                    <Button
                      size="xs"
                      variant="outline"
                      fontSize="11px"
                      color="#3a2f26"
                      borderColor="#3a2f26"
                      _hover={{ bg: "#e8d4b0" }}
                      onClick={() =>
                        handleEditClick({
                          id: edge.node.id,
                          title: edge.node.title,
                        })
                      }
                    >
                      Edit
                    </Button>
                    <Button
                      size="xs"
                      variant="outline"
                      colorScheme="orange"
                      fontSize="11px"
                      onClick={() =>
                        handleResetFogClick({
                          id: edge.node.id,
                          title: edge.node.title,
                        })
                      }
                    >
                      Reset Fog
                    </Button>
                  </HStack>
                </MapInfo>
              </MapCard>
            ))}
          </SimpleGrid>

          {/* Pagination Controls */}
          {totalCount > sortedMaps.length && (
            <Box
              bg="orange.100"
              color="orange.800"
              p={3}
              borderRadius="md"
              textAlign="center"
              mb={4}
            >
              <Text fontSize="sm">
                ⚠️ Showing {sortedMaps.length} of {totalCount} maps. Use the
                search box to filter and find specific maps.
              </Text>
            </Box>
          )}
          {totalDisplayPages > 1 && (
            <HStack justifyContent="center" spacing={4} mt={4}>
              <Button
                size="sm"
                variant="solid"
                bg={COLORS.cardBg}
                color={COLORS.text}
                borderColor={COLORS.border}
                border="1px solid"
                _hover={{ bg: COLORS.cardBgEnd }}
                onClick={() => setDisplayPage(1)}
                isDisabled={displayPage === 1}
              >
                First
              </Button>
              <Button
                size="sm"
                variant="solid"
                bg={COLORS.cardBg}
                color={COLORS.text}
                borderColor={COLORS.border}
                border="1px solid"
                _hover={{ bg: COLORS.cardBgEnd }}
                onClick={() => setDisplayPage(displayPage - 1)}
                isDisabled={displayPage === 1}
              >
                Prev
              </Button>
              <Text color={COLORS.text} fontSize="14px">
                Page {displayPage} of {totalDisplayPages} ({sortedMaps.length}{" "}
                loaded / {totalCount} total)
              </Text>
              <Button
                size="sm"
                variant="solid"
                bg={COLORS.cardBg}
                color={COLORS.text}
                borderColor={COLORS.border}
                border="1px solid"
                _hover={{ bg: COLORS.cardBgEnd }}
                onClick={() => setDisplayPage(displayPage + 1)}
                isDisabled={displayPage === totalDisplayPages}
              >
                Next
              </Button>
              <Button
                size="sm"
                variant="solid"
                bg={COLORS.cardBg}
                color={COLORS.text}
                borderColor={COLORS.border}
                border="1px solid"
                _hover={{ bg: COLORS.cardBgEnd }}
                onClick={() => setDisplayPage(totalDisplayPages)}
                isDisabled={displayPage === totalDisplayPages}
              >
                Last
              </Button>
            </HStack>
          )}
        </>
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
              Delete Map
            </AlertDialogHeader>
            <AlertDialogBody color={COLORS.textLight}>
              Are you sure you want to delete "{selectedMap?.title}"? This
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

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose}>
        <ModalOverlay />
        <ModalContent bg="#454545" borderColor={COLORS.burgundy}>
          <ModalHeader color={COLORS.tanLight}>Edit Map</ModalHeader>
          <ModalCloseButton color={COLORS.textLight} />
          <ModalBody>
            <FormControl>
              <FormLabel color={COLORS.textLight}>Map Title</FormLabel>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                bg={COLORS.contentBg}
                borderColor={COLORS.burgundy}
                color={COLORS.textLight}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onEditClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleEditSave}
              isLoading={isUpdating}
            >
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Reset Fog Confirmation Dialog */}
      <AlertDialog
        isOpen={isResetFogOpen}
        leastDestructiveRef={cancelFogRef}
        onClose={onResetFogClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent bg="#454545" borderColor={COLORS.burgundy}>
            <AlertDialogHeader color={COLORS.tanLight}>
              Reset Fog
            </AlertDialogHeader>
            <AlertDialogBody color={COLORS.textLight}>
              Are you sure you want to reset the fog for "{selectedMap?.title}"?
              This will hide the entire map from players (full fog coverage).
              This is useful if the fog file became corrupted.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelFogRef} onClick={onResetFogClose}>
                Cancel
              </Button>
              <Button
                colorScheme="orange"
                onClick={handleResetFogConfirm}
                ml={3}
                isLoading={isResettingFog}
              >
                Reset Fog
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Duplicate Maps Modal */}
      <Modal
        isOpen={isDuplicateModalOpen}
        onClose={handleDuplicateCancel}
        size="xl"
      >
        <ModalOverlay />
        <ModalContent
          bg={COLORS.cardBg}
          borderColor={COLORS.border}
          borderWidth="3px"
          maxW="700px"
        >
          <ModalHeader color={COLORS.text} fontFamily="Georgia, serif">
            ⚠️ Duplicate Maps Detected
          </ModalHeader>
          <ModalCloseButton color={COLORS.text} />
          <ModalBody>
            <Text color={COLORS.textLight} mb={4}>
              The following maps already exist. Choose an action for each:
            </Text>
            <Box
              maxH="300px"
              overflowY="auto"
              border="1px solid"
              borderColor={COLORS.border}
              borderRadius="md"
            >
              <Table size="sm" variant="simple">
                <Thead bg={COLORS.cardBgEnd} position="sticky" top={0}>
                  <Tr>
                    <Th color={COLORS.text}>File Name</Th>
                    <Th color={COLORS.text}>Action</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {pendingUploads
                    .filter((u) => u.duplicateOf)
                    .map((upload) => (
                      <Tr key={upload.file.name}>
                        <Td color={COLORS.text}>
                          <Text fontWeight="bold">{upload.file.name}</Text>
                          <Text fontSize="xs" color={COLORS.textLight}>
                            Existing: "{upload.duplicateOf?.title}"
                          </Text>
                        </Td>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <HStack>
                              <input
                                type="radio"
                                name={`action-${upload.file.name}`}
                                checked={
                                  duplicateActions.get(upload.file.name) ===
                                  "skip"
                                }
                                onChange={() =>
                                  setDuplicateAction(upload.file.name, "skip")
                                }
                              />
                              <Text color={COLORS.text} fontSize="sm">
                                Skip (don't upload)
                              </Text>
                            </HStack>
                            <HStack>
                              <input
                                type="radio"
                                name={`action-${upload.file.name}`}
                                checked={
                                  duplicateActions.get(upload.file.name) ===
                                  "replace"
                                }
                                onChange={() =>
                                  setDuplicateAction(
                                    upload.file.name,
                                    "replace"
                                  )
                                }
                              />
                              <Text color={COLORS.text} fontSize="sm">
                                Replace existing
                              </Text>
                            </HStack>
                            <HStack>
                              <input
                                type="radio"
                                name={`action-${upload.file.name}`}
                                checked={
                                  duplicateActions.get(upload.file.name) ===
                                  "rename"
                                }
                                onChange={() =>
                                  setDuplicateAction(upload.file.name, "rename")
                                }
                              />
                              <Text color={COLORS.text} fontSize="sm">
                                Upload with new name
                              </Text>
                            </HStack>
                          </VStack>
                        </Td>
                      </Tr>
                    ))}
                </Tbody>
              </Table>
            </Box>
            <HStack mt={4} spacing={4}>
              <Button
                size="sm"
                variant="outline"
                borderColor={COLORS.border}
                color={COLORS.text}
                onClick={() => {
                  const next = new Map(duplicateActions);
                  pendingUploads
                    .filter((u) => u.duplicateOf)
                    .forEach((u) => next.set(u.file.name, "skip"));
                  setDuplicateActions(next);
                }}
              >
                Skip All
              </Button>
              <Button
                size="sm"
                variant="outline"
                borderColor={COLORS.border}
                color={COLORS.text}
                onClick={() => {
                  const next = new Map(duplicateActions);
                  pendingUploads
                    .filter((u) => u.duplicateOf)
                    .forEach((u) => next.set(u.file.name, "replace"));
                  setDuplicateActions(next);
                }}
              >
                Replace All
              </Button>
              <Button
                size="sm"
                variant="outline"
                borderColor={COLORS.border}
                color={COLORS.text}
                onClick={() => {
                  const next = new Map(duplicateActions);
                  pendingUploads
                    .filter((u) => u.duplicateOf)
                    .forEach((u) => next.set(u.file.name, "rename"));
                  setDuplicateActions(next);
                }}
              >
                Rename All
              </Button>
            </HStack>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="ghost"
              mr={3}
              onClick={handleDuplicateCancel}
              color={COLORS.text}
            >
              Cancel
            </Button>
            <Button
              bg={COLORS.accent}
              color="white"
              onClick={handleDuplicateConfirm}
              _hover={{ bg: COLORS.border }}
            >
              Confirm Upload
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Image Preview Modal */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={onPreviewClose}
        size="4xl"
        isCentered
      >
        <ModalOverlay bg="blackAlpha.700" />
        <ModalContent bg={COLORS.cardBg} maxW="90vw" maxH="90vh">
          <ModalHeader
            color={COLORS.text}
            borderBottom="1px solid"
            borderColor={COLORS.border}
          >
            {previewMap?.title || "Map Preview"}
          </ModalHeader>
          <ModalCloseButton color={COLORS.text} />
          <ModalBody
            p={4}
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            {previewMap?.url ? (
              <img
                src={previewMap.url}
                alt={previewMap.title}
                style={{
                  maxWidth: "100%",
                  maxHeight: "70vh",
                  objectFit: "contain",
                  borderRadius: "8px",
                }}
              />
            ) : (
              <Text color={COLORS.textLight}>No image available</Text>
            )}
          </ModalBody>
          <ModalFooter borderTop="1px solid" borderColor={COLORS.border}>
            <Button
              variant="ghost"
              onClick={onPreviewClose}
              color={COLORS.text}
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};
