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
} from "@chakra-ui/react";
import graphql from "babel-plugin-relay/macro";
import { useQuery } from "relay-hooks";
import { dashboardTab_MapsQuery } from "./__generated__/dashboardTab_MapsQuery.graphql";
import { dashboardTab_TokensQuery } from "./__generated__/dashboardTab_TokensQuery.graphql";
import { dashboardTab_NotesQuery } from "./__generated__/dashboardTab_NotesQuery.graphql";

const COLORS = {
  burgundy: "#8B3A3A",
  tan: "#D4C4B9",
  tanLight: "#E8DCD2",
  darkBg: "#2A2A2A",
  contentBg: "#3A3A3A",
  textLight: "#E8DCD2",
};

const StatCard = styled(Box)`
  background: linear-gradient(135deg, ${COLORS.contentBg} 0%, #454545 100%);
  border: 1px solid ${COLORS.burgundy};
  border-radius: 4px;
  padding: 24px;
  text-align: center;

  &:hover {
    border-color: ${COLORS.tan};
    transform: translateY(-2px);
    transition: all 0.2s ease;
  }
`;

const StatNumber = styled.div`
  font-size: 42px;
  font-weight: bold;
  color: ${COLORS.tan};
  font-family: Georgia, serif;
  margin: 12px 0;
`;

const StatLabel = styled.div`
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: ${COLORS.textLight};
  font-family: Georgia, serif;
`;

const PageTitle = styled.h1`
  font-size: 32px;
  font-weight: bold;
  color: ${COLORS.tanLight};
  margin-bottom: 24px;
  font-family: Georgia, serif;
  text-transform: uppercase;
  letter-spacing: 2px;
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

export const DashboardTab: React.FC = () => {
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
    <VStack align="stretch" spacing={8}>
      <Box>
        <PageTitle>📊 Dashboard</PageTitle>
        <Text color={COLORS.textLight} fontSize="14px" mb={8}>
          Overview of your server resources
        </Text>
      </Box>

      {/* Statistics Grid */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
        <StatCard>
          <StatLabel>📊 Total Maps</StatLabel>
          <StatNumber>{mapsCount}</StatNumber>
          <Text fontSize="12px" color={COLORS.textLight}>
            Available maps on server
          </Text>
        </StatCard>

        <StatCard>
          <StatLabel>🎯 Total Tokens</StatLabel>
          <StatNumber>{tokensCount}</StatNumber>
          <Text fontSize="12px" color={COLORS.textLight}>
            Token images available
          </Text>
        </StatCard>

        <StatCard>
          <StatLabel>📝 Total Notes</StatLabel>
          <StatNumber>{notesCount}</StatNumber>
          <Text fontSize="12px" color={COLORS.textLight}>
            Shared resource notes
          </Text>
        </StatCard>
      </SimpleGrid>

      {/* Quick Actions Section */}
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
          🚀 Quick Actions
        </Text>
        <VStack
          align="start"
          spacing={2}
          fontSize="14px"
          color={COLORS.textLight}
        >
          <Text>
            • Navigate to <strong>Maps</strong> tab to upload or manage maps
          </Text>
          <Text>
            • Navigate to <strong>Tokens</strong> tab to upload or manage tokens
          </Text>
          <Text>
            • Navigate to <strong>Notes</strong> tab to import monsters from
            Excel
          </Text>
        </VStack>
      </Box>

      {/* Server Info Section */}
      <Box
        bg={COLORS.contentBg}
        border={`1px solid ${COLORS.burgundy}`}
        borderRadius="4px"
        p={6}
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
          ℹ️ Server Information
        </Text>
        <VStack
          align="start"
          spacing={3}
          fontSize="13px"
          color={COLORS.textLight}
        >
          <HStack justify="space-between" width="100%">
            <Text>API Version:</Text>
            <Text color={COLORS.tan}>v1.17.1</Text>
          </HStack>
          <HStack justify="space-between" width="100%">
            <Text>Status:</Text>
            <Text color="#4ade80">● Online</Text>
          </HStack>
          <HStack justify="space-between" width="100%">
            <Text>Database:</Text>
            <Text color={COLORS.tan}>SQLite</Text>
          </HStack>
        </VStack>
      </Box>
    </VStack>
  );
};
