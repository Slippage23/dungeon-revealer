/**
 * Map Combat Bar Component
 * Displays initiative order as a bar at the top of the map view
 * Shows token names/labels in initiative order with current turn highlighted
 */

import React from "react";
import styled from "@emotion/styled/macro";
import graphql from "babel-plugin-relay/macro";
import { useQuery, useMutation } from "relay-hooks";
import {
  HStack,
  Box,
  Button,
  Badge,
  Tooltip,
  Flex,
  VStack,
  Text,
  useToast,
} from "@chakra-ui/react";
import { ChevronRight } from "../feather-icons";
import { mapCombatBar_Query$data } from "./__generated__/mapCombatBar_Query.graphql";

// GraphQL Query
const MapCombatBar_Query = graphql`
  query mapCombatBar_Query($mapId: String!, $mapIdForTokens: ID!) @live {
    combatState(mapId: $mapId) {
      mapId
      isActive
      currentRound
      activeTokenId
      initiatives {
        id
        tokenId
        initiativeValue
        isActive
        orderIndex
      }
    }
    mapTokens(mapId: $mapIdForTokens) {
      id
      label
    }
  }
`;

// GraphQL Mutation to advance initiative
const MapCombatBar_AdvanceMutation = graphql`
  mutation mapCombatBar_AdvanceMutation($mapId: String!) {
    advanceInitiative(mapId: $mapId) {
      mapId
      isActive
      currentRound
      activeTokenId
      initiatives {
        id
        tokenId
        initiativeValue
        isActive
        orderIndex
      }
    }
  }
`;

interface MapCombatBarProps {
  mapId: string;
}

// Styled components
const BarContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-bottom: 2px solid #e94560;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  overflow-x: auto;
  overflow-y: visible;
  min-height: 60px;
  flex-wrap: wrap;
  position: relative;
  z-index: 10;
  flex-shrink: 0;

  &::-webkit-scrollbar {
    height: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: #e94560;
    border-radius: 3px;
  }
`;

const TokenInitiativeItem = styled(Box)<{
  isActive: boolean;
  isDefeated?: boolean;
}>`
  padding: 8px 12px;
  border-radius: 6px;
  background: ${(props) =>
    props.isActive ? "#e94560" : props.isDefeated ? "#555" : "#2d3561"};
  color: ${(props) => (props.isDefeated ? "#999" : "#fff")};
  font-weight: ${(props) => (props.isActive ? "bold" : "normal")};
  font-size: 14px;
  border: 2px solid ${(props) => (props.isActive ? "#ff6b7a" : "transparent")};
  box-shadow: ${(props) =>
    props.isActive ? "0 0 12px rgba(233, 69, 96, 0.6)" : "none"};
  white-space: nowrap;
  text-decoration: ${(props) => (props.isDefeated ? "line-through" : "none")};
  opacity: ${(props) => (props.isDefeated ? 0.6 : 1)};
  transition: all 0.2s ease;

  &:hover {
    transform: ${(props) => (props.isDefeated ? "none" : "translateY(-2px)")};
    box-shadow: ${(props) =>
      props.isActive
        ? "0 0 12px rgba(233, 69, 96, 0.6)"
        : "0 2px 8px rgba(0, 0, 0, 0.3)"};
  }
`;

const RoundBadge = styled(Badge)`
  background: #2d3561;
  color: #fff;
  padding: 6px 10px;
  border-radius: 4px;
  font-weight: bold;
  white-space: nowrap;
`;

export const MapCombatBar: React.FC<MapCombatBarProps> = ({ mapId }) => {
  const toast = useToast();

  // Query combat state - ALWAYS called, regardless of conditions
  const queryResult = useQuery<mapCombatBar_Query$data>(MapCombatBar_Query, {
    mapId: mapId || "",
    mapIdForTokens: mapId || "",
  });

  // Mutation to advance to next turn - ALWAYS called
  const [advanceMutation] = useMutation(MapCombatBar_AdvanceMutation);

  const data = queryResult.data;
  const combatState = data?.combatState;
  const tokens = data?.mapTokens || [];

  // Create a map of token IDs to labels - ALWAYS called
  const tokenLabelsMap = React.useMemo(() => {
    const map = new Map<string, string>();
    tokens.forEach((token) => {
      if (token?.id && token?.label) {
        map.set(token.id, token.label);
      }
    });
    return map;
  }, [tokens]);

  const initiatives = combatState?.initiatives || [];
  // Sort initiatives - ALWAYS called
  const sortedInitiatives = React.useMemo(() => {
    return [...initiatives].sort((a, b) => {
      const orderA = a?.orderIndex ?? 0;
      const orderB = b?.orderIndex ?? 0;
      return orderA - orderB;
    });
  }, [initiatives]);

  // Now check conditions AFTER all hooks are called
  if (!mapId || !combatState?.isActive) {
    return null;
  }

  const handleAdvanceTurn = () => {
    advanceMutation({
      variables: { mapId },
      onCompleted: () => {
        // Success - Relay will automatically update the UI
      },
      onError: (err) => {
        console.error("Error advancing initiative:", err);
        toast({
          title: "Error",
          description: "Failed to advance turn",
          status: "error",
          duration: 3,
          isClosable: true,
        });
      },
    });
  };

  return (
    <BarContainer>
      <Tooltip label={`Round ${combatState.currentRound || 1}`}>
        <RoundBadge>R{combatState.currentRound || 1}</RoundBadge>
      </Tooltip>

      <Flex gap={2} flex={1} flexWrap="wrap" alignItems="center">
        {sortedInitiatives.length === 0 ? (
          <Text fontSize="sm" color="gray.400">
            No combatants
          </Text>
        ) : (
          sortedInitiatives.map((initiative, index) => {
            const tokenId = initiative?.tokenId;
            const label = tokenId ? tokenLabelsMap.get(tokenId) : "Unknown";
            const isActive = initiative?.isActive || false;
            const value = initiative?.initiativeValue || 0;

            return (
              <Tooltip
                key={initiative?.id || index}
                label={`Initiative: ${value}`}
              >
                <TokenInitiativeItem isActive={isActive}>
                  {label || `Token ${index + 1}`}
                </TokenInitiativeItem>
              </Tooltip>
            );
          })
        )}
      </Flex>

      <Tooltip label="Next Turn">
        <Button
          size="sm"
          colorScheme="red"
          leftIcon={<ChevronRight size={16} />}
          onClick={handleAdvanceTurn}
          whiteSpace="nowrap"
        >
          Next
        </Button>
      </Tooltip>
    </BarContainer>
  );
};
