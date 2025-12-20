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
  cardBg: "#f5ead8",
  cardBgEnd: "#e8d4b0",
  border: "#3a2f26",
  text: "#3a2f26",
  textLight: "#5a4d3e",
  accent: "#8b4513",
  success: "#228b22",
};

const StatCard = styled(Box)`
  background: linear-gradient(
    180deg,
    ${COLORS.cardBg} 0%,
    ${COLORS.cardBgEnd} 100%
  );
  border: 3px solid ${COLORS.border};
  border-radius: 8px;
  padding: 28px 24px;
  text-align: center;
  transition: all 0.3s ease;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);

  &:hover {
    border-color: ${COLORS.accent};
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.6),
      inset 0 1px 0 rgba(255, 255, 255, 0.5);
  }
`;

const StatNumber = styled.div`
  font-size: 48px;
  font-weight: bold;
  color: ${COLORS.text};
  font-family: Georgia, "Times New Roman", serif;
  margin: 12px 0;
`;

const StatLabel = styled.div`
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: ${COLORS.textLight};
  font-family: Georgia, "Times New Roman", serif;
`;

const SectionTitle = styled.h2`
  font-size: 22px;
  font-weight: bold;
  color: ${COLORS.text};
  margin-bottom: 12px;
  font-family: folkard, Georgia, serif;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const SectionDescription = styled.p`
  font-size: 16px;
  color: ${COLORS.textLight};
  margin-bottom: 16px;
  font-family: Georgia, "Times New Roman", serif;
`;

const ActionButton = styled(Button)`
  background-color: ${COLORS.accent};
  color: #fff;
  border: 2px solid ${COLORS.border};
  border-radius: 6px;
  padding: 12px 20px;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 14px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background-color: ${COLORS.border};
    border-color: ${COLORS.accent};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(58, 47, 38, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

const PageTitle = styled.h1`
  font-size: 36px;
  font-weight: bold;
  color: ${COLORS.text};
  margin-bottom: 24px;
  font-family: folkard, Georgia, serif;
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
        <Spinner size="xl" color={COLORS.accent} />
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
          <StatLabel>Maps</StatLabel>
          <StatNumber>{mapsCount}</StatNumber>
        </StatCard>

        <StatCard>
          <StatLabel>Tokens</StatLabel>
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
        bg={`linear-gradient(180deg, ${COLORS.cardBg} 0%, ${COLORS.cardBgEnd} 100%)`}
        border={`3px solid ${COLORS.border}`}
        borderRadius="8px"
        p={8}
        mt={4}
        boxShadow="0 6px 16px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.5)"
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
            onClick={() => onNavigate?.("maps")}
          >
            View Maps
          </ActionButton>
          <ActionButton
            leftIcon={<span>🎯</span>}
            onClick={() => onNavigate?.("tokens")}
          >
            Manage Tokens
          </ActionButton>
        </HStack>
      </Box>
    </VStack>
  );
};
