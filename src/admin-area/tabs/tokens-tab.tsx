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
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Switch,
  Collapse,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import graphql from "babel-plugin-relay/macro";
import { useQuery } from "relay-hooks";
import { tokensTab_TokensQuery } from "./__generated__/tokensTab_TokensQuery.graphql";
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

const TokenCard = styled(Box)`
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

const TokenImage = styled.div`
  width: 100%;
  height: 120px;
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
    border-radius: 50%;
  }
`;

const TokenInfo = styled(Box)`
  padding: 12px;
`;

const TokenTitle = styled.div`
  font-size: 16px;
  font-weight: bold;
  color: ${COLORS.text};
  margin-bottom: 4px;
  font-family: Georgia, "Times New Roman", serif;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TokenMeta = styled.div`
  font-size: 14px;
  color: ${COLORS.textLight};
  margin-bottom: 8px;
  font-family: Georgia, "Times New Roman", serif;
`;

const tokensQuery = graphql`
  query tokensTab_TokensQuery(
    $first: Int
    $after: String
    $titleFilter: String
  ) {
    tokenImages(first: $first, after: $after, titleFilter: $titleFilter) {
      edges {
        node {
          id
          title
          url
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

export const TokensTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isUploading, setIsUploading] = React.useState(false);
  const [isBulkUploading, setIsBulkUploading] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);
  const [isSavingSettings, setIsSavingSettings] = React.useState(false);
  const [managerConfig, setManagerConfig] = React.useState<any>(null);
  const [editTokenDirectory, setEditTokenDirectory] = React.useState("");
  const toast = useToast();
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
        setEditTokenDirectory(json.data.tokenDirectory || "");
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
          tokenDirectory: editTokenDirectory,
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

  const handleBulkUploadTokens = async () => {
    if (
      !confirm(
        "Upload all token images from configured Token Directory to server?"
      )
    )
      return;
    setIsBulkUploading(true);
    try {
      const res = await fetch(buildApiUrl("/manager/upload-tokens"), {
        method: "POST",
        headers: {
          Authorization: accessToken ? `Bearer ${accessToken}` : "",
        },
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error.message);
      toast({
        title: "Bulk upload complete",
        description: `Imported ${json.data?.imported || 0} tokens`,
        status: "success",
        duration: 4000,
      });
      retry();
    } catch (err: any) {
      toast({
        title: "Bulk token upload failed",
        description: err.message,
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsBulkUploading(false);
    }
  };

  const [selectedToken, setSelectedToken] = React.useState<{
    id: string;
    title: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  const { data, isLoading, error, retry } = useQuery<tokensTab_TokensQuery>(
    tokensQuery,
    {
      first: 12,
      titleFilter: searchTerm || undefined,
    }
  );

  const handleDeleteClick = (token: { id: string; title: string }) => {
    setSelectedToken(token);
    onDeleteOpen();
  };

  const handleDeleteConfirm = async () => {
    if (!selectedToken) return;

    // Extract the actual ID from the Relay global ID
    // Relay IDs are base64 encoded: "01:TypeName:actualId"
    let tokenId = selectedToken.id;
    try {
      const decoded = atob(tokenId);
      const parts = decoded.split(":");
      if (parts.length >= 3) {
        tokenId = parts.slice(2).join(":");
      }
    } catch {
      // If decoding fails, use the ID as-is
    }

    setIsDeleting(true);
    try {
      const response = await fetch(buildApiUrl(`/images/${tokenId}`), {
        method: "DELETE",
        headers: {
          Authorization: accessToken ? `Bearer ${accessToken}` : "",
        },
      });

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.statusText}`);
      }

      toast({
        title: "Token deleted",
        description: `Deleted token: ${selectedToken.title}`,
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
      setSelectedToken(null);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate image file
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        status: "error",
        duration: 3000,
      });
      return;
    }

    setIsUploading(true);

    try {
      // Use the REST API to upload the image
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(buildApiUrl("/images"), {
        method: "POST",
        headers: {
          Authorization: accessToken ? `Bearer ${accessToken}` : "",
        },
        body: file,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      toast({
        title: "Token uploaded",
        description: `Successfully uploaded ${file.name}`,
        status: "success",
        duration: 3000,
      });

      // Refresh the list
      retry();
    } catch (err) {
      console.error("Token upload failed:", err);
      toast({
        title: "Upload failed",
        description: err instanceof Error ? err.message : "Unknown error",
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const tokens = data?.tokenImages?.edges || [];

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
        <Text>Error loading tokens: {error.message}</Text>
      </Box>
    );
  }

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
              Bulk Upload Tokens
            </Text>
            <Text fontSize="12px" color="#A89890">
              {managerConfig?.tokenDirectory
                ? `Directory: ${managerConfig.tokenDirectory}`
                : "Configure a Token Directory to enable bulk upload"}
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
              onClick={handleBulkUploadTokens}
              isDisabled={isBulkUploading || !managerConfig?.tokenDirectory}
              isLoading={isBulkUploading}
              loadingText="Uploading..."
            >
              Upload Tokens
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
                  Token Directory (server path)
                </FormLabel>
                <Input
                  size="sm"
                  bg="#3A3A3A"
                  borderColor={COLORS.burgundy}
                  color={COLORS.textLight}
                  value={editTokenDirectory}
                  onChange={(e) => setEditTokenDirectory(e.target.value)}
                  placeholder="e.g., C:\Tokens or /home/user/tokens"
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
        <PageTitle>🎯 Tokens Management</PageTitle>
        <Text color={COLORS.textLight} fontSize="14px">
          Upload, manage, and organize your token images
        </Text>
      </Box>

      {/* Hidden file input for upload */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept="image/*"
        onChange={handleFileSelect}
      />

      {/* Action Bar */}
      <ActionBar justifyContent="space-between" width="100%">
        <Input
          placeholder="Search tokens by name..."
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
            onClick={handleUploadClick}
            isLoading={isUploading}
            loadingText="Uploading..."
          >
            📤 Upload Token
          </UploadButton>
        </HStack>
      </ActionBar>

      {/* Tokens Grid */}
      {tokens.length === 0 ? (
        <Center p={12}>
          <VStack spacing={4}>
            <Text fontSize="18px" color={COLORS.textLight}>
              {searchTerm ? "No tokens match your search" : "No tokens yet"}
            </Text>
            <Text fontSize="12px" color={COLORS.textLight} opacity={0.6}>
              Upload a token image to get started
            </Text>
          </VStack>
        </Center>
      ) : (
        <SimpleGrid columns={{ base: 2, md: 3, lg: 4, xl: 6 }} spacing={4}>
          {tokens.map((edge) => (
            <TokenCard key={edge.node.id}>
              <TokenImage>
                {edge.node.url ? (
                  <img src={edge.node.url} alt={edge.node.title} />
                ) : (
                  <Text>No image</Text>
                )}
              </TokenImage>
              <TokenInfo>
                <TokenTitle title={edge.node.title}>
                  {edge.node.title}
                </TokenTitle>
                <TokenMeta>Token</TokenMeta>
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
                </HStack>
              </TokenInfo>
            </TokenCard>
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
              Delete Token
            </AlertDialogHeader>
            <AlertDialogBody color={COLORS.textLight}>
              Are you sure you want to delete "{selectedToken?.title}"? This
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
    </VStack>
  );
};
