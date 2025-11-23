/**
 * Initiative Tracker View (Read-Only)
 * Displays combat information to players in real-time
 * No editing capabilities - for viewing only
 */

import React from "react";
import graphql from "babel-plugin-relay/macro";
import { useQuery } from "relay-hooks";
import {
  Box,
  VStack,
  HStack,
  Badge,
  Tooltip,
  Heading,
  Divider,
  Text,
  List,
  ListItem,
} from "@chakra-ui/react";
import styled from "@emotion/styled/macro";
import { DraggableWindow } from "../draggable-window";

// GraphQL Query
const InitiativeTrackerView_CombatStateQuery = graphql`
  query initiativeTrackerViewCombatStateQuery($mapId: String!) @live {
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
        roundNumber
        orderIndex
      }
    }
  }
`;

const InitiativeListItem = styled(ListItem)<{ isActive: boolean }>`
  padding: 12px;
  border-radius: 6px;
  background-color: ${(props) => (props.isActive ? "#e6f7ff" : "#ffffff")};
  border: ${(props) =>
    props.isActive ? "2px solid #1890ff" : "1px solid #e2e8f0"};
  margin-bottom: 8px;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${(props) => (props.isActive ? "#e6f7ff" : "#f7fafc")};
  }
`;

interface InitiativeTrackerViewProps {
  mapId: string;
  onClose: () => void;
}

export const InitiativeTrackerView: React.FC<InitiativeTrackerViewProps> = ({
  mapId,
  onClose,
}) => {
  // Query combat state
  const { data, error } = useQuery(
    InitiativeTrackerView_CombatStateQuery,
    { mapId },
    { fetchPolicy: "store-and-network" }
  );

  const combatState = (data as any)?.combatState;
  const initiatives = combatState?.initiatives || [];
  const isInCombat = combatState?.isActive || false;
  const currentRound = combatState?.currentRound || 1;

  if (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : typeof error === "string"
        ? error
        : "Unknown error";
    return (
      <DraggableWindow
        headerContent="Initiative - Error"
        close={onClose}
        onKeyDown={() => {}}
        bodyContent={
          <Box p={4}>
            <Text color="red.500">
              Failed to load combat state: {errorMessage}
            </Text>
          </Box>
        }
      />
    );
  }

  return (
    <DraggableWindow
      headerContent={
        <HStack gap={2} flex={1}>
          <Text>Initiative Order</Text>
          {isInCombat && (
            <Badge colorScheme="green" fontSize="sm">
              Round {currentRound}
            </Badge>
          )}
          {!isInCombat && (
            <Badge colorScheme="gray" fontSize="sm">
              Not in Combat
            </Badge>
          )}
        </HStack>
      }
      close={onClose}
      onKeyDown={() => {}}
      bodyContent={
        <Box p={4} overflowY="auto" maxHeight="70vh" minWidth="300px">
          <VStack spacing={4} align="stretch">
            {/* Combat Status */}
            {!isInCombat && (
              <Box
                textAlign="center"
                py={8}
                color="gray.500"
                borderRadius="md"
                bg="gray.50"
              >
                <Text fontSize="sm" fontWeight="medium">
                  Waiting for combat to begin...
                </Text>
              </Box>
            )}

            {/* Initiative List */}
            {initiatives.length === 0 ? (
              <Box textAlign="center" py={8} color="gray.500">
                <Text>No combatants in this battle</Text>
              </Box>
            ) : (
              <List spacing={0}>
                {initiatives.map((initiative: any, index: number) => (
                  <InitiativeListItem
                    key={initiative.id}
                    isActive={initiative.isActive}
                  >
                    <HStack justify="space-between" width="100%">
                      <HStack spacing={3} flex={1}>
                        <Text fontWeight="bold" minWidth="30px">
                          #{index + 1}
                        </Text>
                        <VStack spacing={0} align="flex-start" flex={1}>
                          <Tooltip
                            label={`Token ID: ${initiative.tokenId}`}
                            placement="top"
                          >
                            <Text fontSize="sm" fontWeight="medium">
                              Token {initiative.tokenId.substring(0, 8)}...
                            </Text>
                          </Tooltip>
                          <Text fontSize="xs" color="gray.600">
                            Initiative: {initiative.initiativeValue}
                          </Text>
                        </VStack>
                      </HStack>

                      {initiative.isActive && (
                        <Badge colorScheme="blue" variant="solid">
                          Current
                        </Badge>
                      )}
                    </HStack>
                  </InitiativeListItem>
                ))}
              </List>
            )}

            {/* Footer Info */}
            {isInCombat && (
              <>
                <Divider />
                <Box fontSize="xs" color="gray.600" textAlign="center">
                  <Text>
                    Round {currentRound} •{" "}
                    {initiatives.findIndex((i: any) => i.isActive) + 1} of{" "}
                    {initiatives.length} combatants
                  </Text>
                </Box>
              </>
            )}
          </VStack>
        </Box>
      }
    />
  );
};
