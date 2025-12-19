import * as React from "react";
import styled from "@emotion/styled/macro";
import {
  Box,
  SimpleGrid,
  Text,
  Spinner,
  Center,
  VStack,
  HStack,
  Button,
} from "@chakra-ui/react";
import graphql from "babel-plugin-relay/macro";
import { useQuery } from "relay-hooks";
import { dashboardTab_MapsQuery } from "./__generated__/dashboardTab_MapsQuery.graphql";
import { dashboardTab_TokensQuery } from "./__generated__/dashboardTab_TokensQuery.graphql";
import { dashboardTab_NotesQuery } from "./__generated__/dashboardTab_NotesQuery.graphql";

const COLORS = {
  burgundy: "#8B3A3A",
  burgundyDark: "#5C2323",
  burgundyDarker: "#3D1D1D",
  tan: "#D4C4B9",
  tanLight: "#E8DCD2",
  tanDark: "#C4B4A9",
  gold: "#B8860B",
  darkBg: "#1A1515",
  contentBg: "#2A2420",
  textLight: "#E8DCD2",
  textMuted: "#A89890",
  accent: "#D4A574",
  success: "#6B8E23",
};

const StatCard = styled(Box)`
  background: linear-gradient(
    135deg,
    ${COLORS.contentBg} 0%,
    ${COLORS.burgundyDarker} 100%
  );
  border: 2px solid ${COLORS.tanDark};
  border-radius: 6px;
  padding: 28px 24px;
  text-align: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);

  &:hover {
    border-color: ${COLORS.gold};
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(184, 134, 11, 0.2);
  }
`;

const StatNumber = styled.div`
  font-size: 48px;
  font-weight: bold;
  color: ${COLORS.gold};
  font-family: Georgia, serif;
  margin: 12px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
`;

const StatLabel = styled.div`
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: ${COLORS.textMuted};
  font-family: Georgia, serif;
`;

const SectionTitle = styled.h2`
  font-size: 24px;
  font-weight: bold;
  color: ${COLORS.tanLight};
  margin-bottom: 4px;
  font-family: Georgia, serif;
  display: flex;
  align-items: center;
  gap: 12px;

  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, ${COLORS.burgundy}, transparent);
  }
`;

const SectionDescription = styled.p`
  font-size: 13px;
  color: ${COLORS.textMuted};
  margin-bottom: 20px;
  font-style: italic;
`;

const ActionButton = styled(Button)`
  background-color: ${COLORS.burgundy};
  color: ${COLORS.tanLight};
  border: 1px solid ${COLORS.gold};
  border-radius: 4px;
  padding: 10px 16px;
  font-family: Georgia, serif;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background-color: ${COLORS.burgundyDark};
    border-color: ${COLORS.tanLight};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(139, 58, 58, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

const PageTitle = styled.h1`
  font-size: 32px;
  font-weight: bold;
  color: ${COLORS.tanLight};
  margin-bottom: 24px;
  font-family: Georgia, serif;
  text-transform: uppercase;
  letter-spacing: 2px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const mapQuery = graphql`
  query dashboardTab_MapsQuery($first: Int) {
    maps(first: $first) {
      edges {
        node {
          id
        }
      }
      pageInfo {
        hasNextPage
      }
    }
  }
`;

const tokensQuery = graphql`
  query dashboardTab_TokensQuery($first: Int) {
    tokenImages(first: $first) {
      edges {
        node {
          id
        }
      }
      pageInfo {
        hasNextPage
      }
    }
  }
`;

const notesQuery = graphql`
  query dashboardTab_NotesQuery($first: Int) {
    notes(first: $first) {
      edges {
        node {
          id
        }
      }
      pageInfo {
        hasNextPage
      }
    }
  }
`;

export const DashboardTab: React.FC<{
  onNavigate?: (tab: "dashboard" | "maps" | "tokens" | "notes") => void;
}> = ({ onNavigate }) => {
  const mapQueryResult = useQuery<dashboardTab_MapsQuery>(mapQuery, {
    first: 50,
  });
  const tokensQueryResult = useQuery<dashboardTab_TokensQuery>(tokensQuery, {
    first: 50,
  });
  const notesQueryResult = useQuery<dashboardTab_NotesQuery>(notesQuery, {
    first: 50,
  });

  const mapsCount = mapQueryResult.data?.maps?.edges?.length || 0;
  const tokensCount = tokensQueryResult.data?.tokenImages?.edges?.length || 0;
  const notesCount = notesQueryResult.data?.notes?.edges?.length || 0;

  const isLoading =
    mapQueryResult.isLoading ||
    tokensQueryResult.isLoading ||
    notesQueryResult.isLoading;

  if (isLoading) {
    return (
      <Center height="300px">
        <Spinner size="xl" color={COLORS.tan} />
      </Center>
    );
  }

  return (
    <VStack align="stretch" spacing={12}>
      {/* Page Header */}
      <Box>
        <PageTitle>📊 Statistics</PageTitle>
        <SectionDescription>
          Quick overview of your server resources
        </SectionDescription>
      </Box>

      {/* Statistics Grid */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
        <StatCard>
          <StatLabel>Local Files</StatLabel>
          <StatNumber>{mapsCount}</StatNumber>
        </StatCard>

        <StatCard>
          <StatLabel>Server Maps</StatLabel>
          <StatNumber>{tokensCount}</StatNumber>
        </StatCard>

        <StatCard>
          <StatLabel>Connection</StatLabel>
          <StatNumber style={{ fontSize: "28px" }}>✓</StatNumber>
          <Text fontSize="13px" color={COLORS.success} fontWeight="bold">
            Online
          </Text>
        </StatCard>
      </SimpleGrid>

      {/* Refresh Button */}
      <HStack spacing={4}>
        <ActionButton
          onClick={() => window.location.reload()}
          leftIcon={<span>🔄</span>}
        >
          Refresh Statistics
        </ActionButton>
      </HStack>

      {/* Quick Actions Section */}
      <Box
        bg={`linear-gradient(135deg, ${COLORS.contentBg} 0%, ${COLORS.burgundyDarker} 100%)`}
        border={`2px solid ${COLORS.tanDark}`}
        borderRadius="6px"
        p={8}
        mt={4}
        boxShadow="0 4px 12px rgba(0, 0, 0, 0.6)"
      >
        <SectionTitle>🎯 Quick Actions</SectionTitle>
        <HStack spacing={6} mt={6} wrap="wrap">
          <ActionButton
            leftIcon={<span>📤</span>}
            onClick={() => onNavigate?.("maps")}
          >
            Upload Map
          </ActionButton>
          <ActionButton
            leftIcon={<span>🗺️</span>}
            bg={COLORS.contentBg}
            borderColor={COLORS.tanDark}
            _hover={{ bg: COLORS.burgundyDarker }}
            onClick={() => onNavigate?.("maps")}
          >
            View Maps
          </ActionButton>
          <ActionButton
            leftIcon={<span>🎯</span>}
            bg={COLORS.contentBg}
            borderColor={COLORS.tanDark}
            _hover={{ bg: COLORS.burgundyDarker }}
            onClick={() => onNavigate?.("tokens")}
          >
            Manage Tokens
          </ActionButton>
        </HStack>
      </Box>
    </VStack>
  );
};
