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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import graphql from "babel-plugin-relay/macro";
import { useQuery, useMutation } from "relay-hooks";
import { tokensTab_TokensQuery } from "./__generated__/tokensTab_TokensQuery.graphql";
import { tokensTab_UpdateTitleMutation } from "./__generated__/tokensTab_UpdateTitleMutation.graphql";
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
  const toast = useToast();
  const accessToken = useAccessToken();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Rename modal state
  const {
    isOpen: isRenameOpen,
    onOpen: onRenameOpen,
    onClose: onRenameClose,
  } = useDisclosure();
  const [renameToken, setRenameToken] = React.useState<{
    id: string;
    title: string;
  } | null>(null);
  const [newTokenTitle, setNewTokenTitle] = React.useState("");
  const [isRenaming, setIsRenaming] = React.useState(false);

  // GraphQL mutation for renaming
  const UpdateTitleMutation = graphql`
    mutation tokensTab_UpdateTitleMutation(
      $input: TokenImageUpdateTitleInput!
    ) {
      tokenImageUpdateTitle(input: $input) {
        id
        title
      }
    }
  `;
  const [updateTitle] =
    useMutation<tokensTab_UpdateTitleMutation>(UpdateTitleMutation);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Copy files to FormData BEFORE resetting input
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    // Reset input so same files can be selected again
    e.target.value = "";

    setIsUploading(true);
    try {
      const res = await fetch(buildApiUrl("/manager/upload-tokens-browser"), {
        method: "POST",
        headers: {
          Authorization: accessToken ? `Bearer ${accessToken}` : "",
        },
        body: formData,
      });
      const json = await res.json();
      if (json.error && !json.data) throw new Error(json.error.message);

      const imported = json.data?.imported || 0;
      const errors = json.data?.errors || [];

      if (errors.length > 0) {
        toast({
          title: "Partial upload",
          description: `Imported ${imported} tokens. ${errors.length} failed.`,
          status: "warning",
          duration: 5000,
        });
      } else {
        toast({
          title: "Upload complete",
          description: `Imported ${imported} token${imported !== 1 ? "s" : ""}`,
          status: "success",
          duration: 4000,
        });
      }
      retry();
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

  const [selectedToken, setSelectedToken] = React.useState<{
    id: string;
    title: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
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

  const handleRenameClick = (token: { id: string; title: string }) => {
    setRenameToken(token);
    setNewTokenTitle(token.title);
    onRenameOpen();
  };

  const handleRenameConfirm = async () => {
    if (!renameToken || !newTokenTitle.trim()) return;

    setIsRenaming(true);
    try {
      updateTitle({
        variables: {
          input: { id: renameToken.id, title: newTokenTitle.trim() },
        },
        onCompleted: () => {
          toast({
            title: "Token renamed",
            description: `Renamed to "${newTokenTitle.trim()}"`,
            status: "success",
            duration: 3000,
          });
          retry();
          onRenameClose();
          setRenameToken(null);
          setIsRenaming(false);
        },
        onError: (err) => {
          toast({
            title: "Rename failed",
            description: err.message,
            status: "error",
            duration: 5000,
          });
          setIsRenaming(false);
        },
      });
    } catch (err: any) {
      toast({
        title: "Rename failed",
        description: err.message,
        status: "error",
        duration: 5000,
      });
      setIsRenaming(false);
    }
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
      <Box>
        <PageTitle>🎯 Tokens Management</PageTitle>
        <Text color={COLORS.textLight} fontSize="14px">
          Upload, manage, and organize your token images
        </Text>
      </Box>

      {/* Hidden file input for upload - supports multiple */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept="image/png,image/jpeg,image/gif,image/webp"
        multiple
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
            onClick={() => fileInputRef.current?.click()}
            isLoading={isUploading}
            loadingText="Uploading..."
          >
            � Select Files
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
                    colorScheme="blue"
                    fontSize="11px"
                    onClick={() =>
                      handleRenameClick({
                        id: edge.node.id,
                        title: edge.node.title,
                      })
                    }
                  >
                    Rename
                  </Button>
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

      {/* Rename Modal */}
      <Modal isOpen={isRenameOpen} onClose={onRenameClose}>
        <ModalOverlay />
        <ModalContent bg="#454545" borderColor={COLORS.burgundy}>
          <ModalHeader color={COLORS.tanLight}>Rename Token</ModalHeader>
          <ModalCloseButton color={COLORS.textLight} />
          <ModalBody>
            <FormControl>
              <FormLabel color={COLORS.textLight}>New Name</FormLabel>
              <Input
                value={newTokenTitle}
                onChange={(e) => setNewTokenTitle(e.target.value)}
                bg="#3A3A3A"
                borderColor={COLORS.burgundy}
                color={COLORS.textLight}
                placeholder="Enter new token name"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newTokenTitle.trim()) {
                    handleRenameConfirm();
                  }
                }}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={onRenameClose} mr={3}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleRenameConfirm}
              isLoading={isRenaming}
              isDisabled={!newTokenTitle.trim()}
            >
              Rename
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};
