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
} from "@chakra-ui/react";
import graphql from "babel-plugin-relay/macro";
import { useQuery } from "relay-hooks";
import { tokensTab_TokensQuery } from "./__generated__/tokensTab_TokensQuery.graphql";
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

const TokenCard = styled(Box)`
  background-color: #454545;
  border: 1px solid ${COLORS.burgundy};
  border-radius: 4px;
  overflow: hidden;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${COLORS.tan};
    transform: translateY(-2px);
  }
`;

const TokenImage = styled.div`
  width: 100%;
  height: 120px;
  background-color: ${COLORS.contentBg};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${COLORS.textLight};
  font-size: 12px;
  border-bottom: 1px solid ${COLORS.burgundy};
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
  font-size: 14px;
  font-weight: bold;
  color: ${COLORS.tan};
  margin-bottom: 4px;
  font-family: Georgia, serif;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TokenMeta = styled.div`
  font-size: 12px;
  color: ${COLORS.textLight};
  margin-bottom: 8px;
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
  const [selectedToken, setSelectedToken] = React.useState<{
    id: string;
    title: string;
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
