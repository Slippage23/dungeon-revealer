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
  Select,
} from "@chakra-ui/react";
import graphql from "babel-plugin-relay/macro";
import { useQuery } from "relay-hooks";
import { mapsTab_MapsQuery } from "./__generated__/mapsTab_MapsQuery.graphql";

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

const MapCard = styled(Box)`
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

const MapImage = styled.div`
  width: 100%;
  height: 150px;
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
  }
`;

const MapInfo = styled(Box)`
  padding: 12px;
`;

const MapTitle = styled.div`
  font-size: 14px;
  font-weight: bold;
  color: ${COLORS.tan};
  margin-bottom: 4px;
  font-family: Georgia, serif;
`;

const MapMeta = styled.div`
  font-size: 12px;
  color: ${COLORS.textLight};
  margin-bottom: 8px;
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

export const MapsTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const { data, isLoading, error } = useQuery<mapsTab_MapsQuery>(mapsQuery, {
    first: 12,
    titleNeedle: searchTerm || undefined,
  });

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
          <UploadButton size="sm">📤 Upload Map</UploadButton>
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
                  >
                    Delete
                  </Button>
                  <Button size="xs" variant="outline" fontSize="11px">
                    Edit
                  </Button>
                </HStack>
              </MapInfo>
            </MapCard>
          ))}
        </SimpleGrid>
      )}
    </VStack>
  );
};
