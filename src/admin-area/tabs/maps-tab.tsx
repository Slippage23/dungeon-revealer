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
  Switch,
  Collapse,
  IconButton,
} from "@chakra-ui/react";
import graphql from "babel-plugin-relay/macro";
import { useQuery, useMutation } from "relay-hooks";
import { mapsTab_MapsQuery } from "./__generated__/mapsTab_MapsQuery.graphql";
import { mapsTab_MapImageRequestUploadMutation } from "./__generated__/mapsTab_MapImageRequestUploadMutation.graphql";
import { mapsTab_MapCreateMutation } from "./__generated__/mapsTab_MapCreateMutation.graphql";
import { mapsTab_MapDeleteMutation } from "./__generated__/mapsTab_MapDeleteMutation.graphql";
import { mapsTab_MapUpdateTitleMutation } from "./__generated__/mapsTab_MapUpdateTitleMutation.graphql";
import { generateSHA256FileHash } from "../../crypto";
import { buildApiUrl } from "../../public-url";
import { useAccessToken } from "../../hooks/use-access-token";

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
  }
`;

const mapImageRequestUploadMutation = graphql`
  mutation mapsTab_MapImageRequestUploadMutation(
    $input: MapImageRequestUploadInput!
  ) {
    mapImageRequestUpload(input: $input) {
      id
      uploadUrl
    }
  }
`;

const mapCreateMutation = graphql`
  mutation mapsTab_MapCreateMutation($input: MapCreateInput!) {
    mapCreate(input: $input) {
      ... on MapCreateSuccess {
        __typename
        createdMap {
          id
          title
          mapImageUrl
        }
      }
      ... on MapCreateError {
        __typename
        reason
      }
    }
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
  const [managerConfig, setManagerConfig] = React.useState<any>(null);
  const [isUploadingBulk, setIsUploadingBulk] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);
  const [isSavingSettings, setIsSavingSettings] = React.useState(false);
  const [editScanDirectory, setEditScanDirectory] = React.useState("");
  const [editSkipExisting, setEditSkipExisting] = React.useState(true);
  const accessToken = useAccessToken();

  const loadManagerConfig = async () => {
    try {
      const res = await fetch(buildApiUrl("/manager/config"), {
        headers: {
          Authorization: accessToken ? `Bearer ${accessToken}` : "",
        },
      });
      const json = await res.json();
      if (json && json.data) {
        setManagerConfig(json.data);
        setEditScanDirectory(json.data.scanDirectory || "");
        setEditSkipExisting(json.data.skipExisting ?? true);
      }
    } catch (e) {
      // ignore
    }
  };

  React.useEffect(() => {
    loadManagerConfig();
  }, [accessToken]);

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      const res = await fetch(buildApiUrl("/manager/config"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: accessToken ? `Bearer ${accessToken}` : "",
        },
        body: JSON.stringify({
          scanDirectory: editScanDirectory,
          skipExisting: editSkipExisting,
        }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error.message);
      toast({
        title: "Settings saved",
        status: "success",
        duration: 2000,
      });
      loadManagerConfig();
    } catch (err: any) {
      toast({
        title: "Save failed",
        description: err.message,
        status: "error",
        duration: 4000,
      });
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleBulkUpload = async () => {
    if (!confirm("Upload all images from configured Scan Directory to maps?"))
      return;
    setIsUploadingBulk(true);
    try {
      const res = await fetch(buildApiUrl("/manager/upload-maps"), {
        method: "POST",
        headers: {
          Authorization: accessToken ? `Bearer ${accessToken}` : "",
        },
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error.message);
      toast({
        title: "Bulk upload complete",
        description: `Imported ${json.data?.imported || 0} maps`,
        status: "success",
        duration: 4000,
      });
      // Refresh maps list
      retry();
    } catch (err: any) {
      toast({
        title: "Bulk upload failed",
        description: err.message,
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsUploadingBulk(false);
    }
  };

  const [searchTerm, setSearchTerm] = React.useState("");
  const [isUploading, setIsUploading] = React.useState(false);
  const [selectedMap, setSelectedMap] = React.useState<{
    id: string;
    title: string;
  } | null>(null);
  const [editTitle, setEditTitle] = React.useState("");
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [isResettingFog, setIsResettingFog] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
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

  const { data, isLoading, error, retry } = useQuery<mapsTab_MapsQuery>(
    mapsQuery,
    {
      first: 12,
      titleNeedle: searchTerm || undefined,
    }
  );

  const [mapImageRequestUpload] =
    useMutation<mapsTab_MapImageRequestUploadMutation>(
      mapImageRequestUploadMutation
    );
  const [mapCreate] = useMutation<mapsTab_MapCreateMutation>(mapCreateMutation);
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
          input: { mapId: selectedMap.id, title: editTitle.trim() },
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so same file can be selected again
    e.target.value = "";

    setIsUploading(true);
    try {
      const hash = await generateSHA256FileHash(file);
      const extension = file.name.split(".").pop() ?? "";

      // 1. Request upload URL
      const result = await mapImageRequestUpload({
        variables: {
          input: {
            sha256: hash,
            extension,
          },
        },
      });

      // 2. Upload file to the URL
      const uploadResponse = await fetch(
        result.mapImageRequestUpload.uploadUrl,
        {
          method: "PUT",
          body: file,
        }
      );

      if (uploadResponse.status !== 200) {
        throw new Error("Upload failed: " + uploadResponse.statusText);
      }

      // 3. Create the map
      const createResult = await mapCreate({
        variables: {
          input: {
            title: file.name.replace(/\.[^/.]+$/, ""),
            mapImageUploadId: result.mapImageRequestUpload.id,
          },
        },
      });

      if (createResult.mapCreate.__typename === "MapCreateSuccess") {
        toast({
          title: "Map uploaded successfully",
          description: `Created map: ${createResult.mapCreate.createdMap.title}`,
          status: "success",
          duration: 3000,
        });
        retry(); // Refresh the list
      } else {
        throw new Error(createResult.mapCreate.reason);
      }
    } catch (err: any) {
      toast({
        title: "Upload failed",
        description: err.message,
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const maps = data?.maps?.edges || [];

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

  const filteredMaps = maps.filter((edge) =>
    edge.node.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <VStack align="stretch" spacing={6}>
      {/* Bulk Upload & Settings Panel */}
      <Box
        bg="#454545"
        border={`1px solid ${COLORS.burgundy}`}
        borderRadius="4px"
        p={4}
      >
        <HStack justify="space-between" mb={3}>
          <VStack align="start" spacing={1}>
            <Text fontSize="14px" color="#E8DCD2" fontWeight="bold">
              Bulk Upload Maps
            </Text>
            <Text fontSize="12px" color="#A89890">
              {managerConfig?.scanDirectory
                ? `Directory: ${managerConfig.scanDirectory}`
                : "Configure a Scan Directory to enable bulk upload"}
            </Text>
          </VStack>
          <HStack spacing={2}>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowSettings(!showSettings)}
              color={COLORS.tanLight}
              borderColor={COLORS.burgundy}
            >
              ⚙️ {showSettings ? "Hide" : "Show"} Settings
            </Button>
            <UploadButton
              onClick={handleBulkUpload}
              isDisabled={isUploadingBulk || !managerConfig?.scanDirectory}
              isLoading={isUploadingBulk}
              loadingText="Uploading..."
            >
              Upload Maps
            </UploadButton>
          </HStack>
        </HStack>

        <Collapse in={showSettings} animateOpacity>
          <Box
            mt={4}
            p={4}
            bg={COLORS.contentBg}
            borderRadius="4px"
            border={`1px solid ${COLORS.border}`}
          >
            <VStack align="stretch" spacing={4}>
              <FormControl>
                <FormLabel color={COLORS.tanLight} fontSize="13px">
                  Scan Directory (server path)
                </FormLabel>
                <Input
                  size="sm"
                  bg="#3A3A3A"
                  borderColor={COLORS.burgundy}
                  color={COLORS.textLight}
                  value={editScanDirectory}
                  onChange={(e) => setEditScanDirectory(e.target.value)}
                  placeholder="e.g., C:\Maps or /home/user/maps"
                />
              </FormControl>
              <FormControl display="flex" alignItems="center">
                <FormLabel
                  color={COLORS.tanLight}
                  fontSize="13px"
                  mb={0}
                  mr={4}
                >
                  Skip existing maps
                </FormLabel>
                <Switch
                  isChecked={editSkipExisting}
                  onChange={(e) => setEditSkipExisting(e.target.checked)}
                  colorScheme="green"
                />
              </FormControl>
              <HStack justify="flex-end">
                <UploadButton
                  size="sm"
                  onClick={handleSaveSettings}
                  isLoading={isSavingSettings}
                  loadingText="Saving..."
                >
                  Save Settings
                </UploadButton>
              </HStack>
            </VStack>
          </Box>
        </Collapse>
      </Box>

      <Box>
        <PageTitle>🗺️ Maps Management</PageTitle>
        <Text color={COLORS.textLight} fontSize="14px">
          Upload, manage, and organize your campaign maps
        </Text>
      </Box>

      {/* Action Bar */}
      <ActionBar justifyContent="space-between" width="100%">
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

        <HStack spacing={2}>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept="image/png,image/jpeg"
            onChange={handleFileChange}
          />
          <UploadButton
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            isLoading={isUploading}
            loadingText="Uploading..."
          >
            📤 Upload Map
          </UploadButton>
        </HStack>
      </ActionBar>

      {/* Maps Grid */}
      {filteredMaps.length === 0 ? (
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
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={4}>
          {filteredMaps.map((edge) => (
            <MapCard key={edge.node.id}>
              <MapImage>
                {edge.node.mapImageUrl ? (
                  <img src={edge.node.mapImageUrl} alt={edge.node.title} />
                ) : (
                  <Text>No image</Text>
                )}
              </MapImage>
              <MapInfo>
                <MapTitle>{edge.node.title}</MapTitle>
                <MapMeta>Grid: {edge.node.grid?.columnWidth || "1.0"}x</MapMeta>
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
    </VStack>
  );
};
