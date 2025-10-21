/**
 * Initiative Tracker Component
 * Manages combat turn order and initiative rolls
 */

import React from "react";
import styled from "@emotion/styled/macro";
import graphql from "babel-plugin-relay/macro";
import { useQuery, useMutation } from "relay-hooks";
import {
  Box,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Badge,
  Tooltip,
  IconButton,
  Heading,
  Divider,
  Text,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useToast,
  Flex,
  List,
  ListItem,
} from "@chakra-ui/react";
import { DraggableWindow } from "../draggable-window";
import * as Icon from "../feather-icons";

// GraphQL Queries and Mutations
const InitiativeTracker_CombatStateQuery = graphql`
  query initiativeTrackerCombatStateQuery($mapId: String!) @live {
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

const InitiativeTracker_SetInitiativeMutation = graphql`
  mutation initiativeTrackerSetInitiativeMutation($input: SetInitiativeInput!) {
    setInitiative(input: $input) {
      id
      tokenId
      initiativeValue
      isActive
      orderIndex
    }
  }
`;

const InitiativeTracker_AdvanceMutation = graphql`
  mutation initiativeTrackerAdvanceMutation($mapId: String!) {
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
        roundNumber
        orderIndex
      }
    }
  }
`;

const InitiativeTracker_StartCombatMutation = graphql`
  mutation initiativeTrackerStartCombatMutation($mapId: String!) {
    startCombat(mapId: $mapId) {
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

const InitiativeTracker_EndCombatMutation = graphql`
  mutation initiativeTrackerEndCombatMutation($mapId: String!) {
    endCombat(mapId: $mapId)
  }
`;

const InitiativeTracker_RemoveFromInitiativeMutation = graphql`
  mutation initiativeTrackerRemoveFromInitiativeMutation(
    $mapId: String!
    $tokenId: String!
  ) {
    removeFromInitiative(mapId: $mapId, tokenId: $tokenId)
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

interface InitiativeTrackerProps {
  mapId: string;
  onClose: () => void;
}

export const InitiativeTracker: React.FC<InitiativeTrackerProps> = ({
  mapId,
  onClose,
}) => {
  const toast = useToast();

  // Query combat state
  const { data, error } = useQuery(
    InitiativeTracker_CombatStateQuery,
    { mapId },
    { fetchPolicy: "store-and-network" }
  );

  // Mutations
  const [setInitiative] = useMutation(InitiativeTracker_SetInitiativeMutation);
  const [advanceInitiative] = useMutation(InitiativeTracker_AdvanceMutation);
  const [startCombat] = useMutation(InitiativeTracker_StartCombatMutation);
  const [endCombat] = useMutation(InitiativeTracker_EndCombatMutation);
  const [removeFromInitiative] = useMutation(
    InitiativeTracker_RemoveFromInitiativeMutation
  );

  // Local state for initiative inputs
  const [initiativeInputs, setInitiativeInputs] = React.useState<
    Record<string, string>
  >({});
  const [editingTokenId, setEditingTokenId] = React.useState<string | null>(
    null
  );

  const combatState = data?.combatState;
  const initiatives = combatState?.initiatives || [];
  const isInCombat = combatState?.isActive || false;
  const currentRound = combatState?.currentRound || 1;

  // Handle setting initiative for a token
  const handleSetInitiative = (tokenId: string) => {
    const value = parseInt(initiativeInputs[tokenId] || "0");
    if (isNaN(value)) {
      toast({
        title: "Invalid initiative value",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    setInitiative({
      variables: {
        input: {
          mapId,
          tokenId,
          initiativeValue: value,
        },
      },
      onCompleted: () => {
        toast({
          title: "Initiative set",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
        // Clear input and editing state
        setInitiativeInputs((prev) => {
          const next = { ...prev };
          delete next[tokenId];
          return next;
        });
        setEditingTokenId(null);
      },
      onError: (error) => {
        toast({
          title: "Failed to set initiative",
          description: error.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      },
    });
  };

  // Handle advancing to next turn
  const handleAdvance = () => {
    advanceInitiative({
      variables: { mapId },
      onError: (error) => {
        toast({
          title: "Failed to advance initiative",
          description: error.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      },
    });
  };

  // Handle starting combat
  const handleStartCombat = () => {
    if (initiatives.length === 0) {
      toast({
        title: "No tokens in initiative",
        description: "Add tokens to initiative order first",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    startCombat({
      variables: { mapId },
      onCompleted: () => {
        toast({
          title: "Combat started",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      },
      onError: (error) => {
        toast({
          title: "Failed to start combat",
          description: error.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      },
    });
  };

  // Handle ending combat
  const handleEndCombat = () => {
    endCombat({
      variables: { mapId },
      onCompleted: () => {
        toast({
          title: "Combat ended",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      },
      onError: (error) => {
        toast({
          title: "Failed to end combat",
          description: error.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      },
    });
  };

  // Handle removing token from initiative
  const handleRemove = (tokenId: string) => {
    removeFromInitiative({
      variables: { mapId, tokenId },
      onCompleted: () => {
        toast({
          title: "Token removed from initiative",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      },
      onError: (error) => {
        toast({
          title: "Failed to remove token",
          description: error.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      },
    });
  };

  if (error) {
    return (
      <DraggableWindow
        headerContent="Initiative Tracker - Error"
        close={onClose}
        bodyContent={
          <Box p={4}>
            <Text color="red.500">
              Failed to load combat state: {error.message}
            </Text>
          </Box>
        }
      />
    );
  }

  return (
    <DraggableWindow
      headerContent={
        <Flex align="center" gap={2}>
          <Text>Initiative Tracker</Text>
          {isInCombat && (
            <Badge colorScheme="green" fontSize="sm">
              Round {currentRound}
            </Badge>
          )}
        </Flex>
      }
      close={onClose}
      bodyContent={
        <Box p={4} overflowY="auto" maxHeight="70vh" minWidth="400px">
          <VStack spacing={4} align="stretch">
            {/* Combat Controls */}
            <HStack spacing={2}>
              {!isInCombat ? (
                <Button
                  colorScheme="green"
                  size="sm"
                  leftIcon={<Icon.Play boxSize="16px" />}
                  onClick={handleStartCombat}
                  flex={1}
                >
                  Start Combat
                </Button>
              ) : (
                <>
                  <Button
                    colorScheme="blue"
                    size="sm"
                    leftIcon={<Icon.ChevronRight boxSize="16px" />}
                    onClick={handleAdvance}
                    flex={1}
                  >
                    Next Turn
                  </Button>
                  <Button
                    colorScheme="red"
                    size="sm"
                    leftIcon={<Icon.Square boxSize="16px" />}
                    onClick={handleEndCombat}
                    flex={1}
                  >
                    End Combat
                  </Button>
                </>
              )}
            </HStack>

            <Divider />

            {/* Initiative List */}
            {initiatives.length === 0 ? (
              <Box textAlign="center" py={8} color="gray.500">
                <Text>No tokens in initiative order</Text>
                <Text fontSize="sm" mt={2}>
                  Set initiative values for tokens to begin combat
                </Text>
              </Box>
            ) : (
              <List spacing={0}>
                {initiatives.map((entry) => (
                  <InitiativeListItem
                    key={entry.id}
                    isActive={entry.isActive}
                  >
                    {editingTokenId === entry.tokenId ? (
                      // Edit Mode
                      <Flex gap={2} align="center">
                        <NumberInput
                          value={initiativeInputs[entry.tokenId] || ""}
                          onChange={(valueString) =>
                            setInitiativeInputs((prev) => ({
                              ...prev,
                              [entry.tokenId]: valueString,
                            }))
                          }
                          size="sm"
                          flex={1}
                        >
                          <NumberInputField placeholder="Initiative" />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                        <Button
                          size="sm"
                          colorScheme="blue"
                          onClick={() => handleSetInitiative(entry.tokenId)}
                        >
                          Set
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingTokenId(null);
                            setInitiativeInputs((prev) => {
                              const next = { ...prev };
                              delete next[entry.tokenId];
                              return next;
                            });
                          }}
                        >
                          Cancel
                        </Button>
                      </Flex>
                    ) : (
                      // Display Mode
                      <Flex justify="space-between" align="center">
                        <HStack flex={1} spacing={3}>
                          <Badge
                            colorScheme={entry.isActive ? "blue" : "gray"}
                            fontSize="lg"
                            px={3}
                            py={1}
                            borderRadius="full"
                            minWidth="50px"
                            textAlign="center"
                          >
                            {entry.initiativeValue}
                          </Badge>
                          <VStack align="start" spacing={0} flex={1}>
                            <Text fontWeight="bold" fontSize="sm">
                              Token {entry.tokenId.substring(0, 8)}
                            </Text>
                            {entry.isActive && (
                              <Badge colorScheme="blue" fontSize="xs">
                                ▶ Active Turn
                              </Badge>
                            )}
                          </VStack>
                        </HStack>
                        <HStack spacing={1}>
                          <Tooltip label="Edit initiative">
                            <IconButton
                              aria-label="Edit initiative"
                              icon={<Icon.Edit boxSize="14px" />}
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingTokenId(entry.tokenId);
                                setInitiativeInputs((prev) => ({
                                  ...prev,
                                  [entry.tokenId]: String(
                                    entry.initiativeValue
                                  ),
                                }));
                              }}
                            />
                          </Tooltip>
                          <Tooltip label="Remove from initiative">
                            <IconButton
                              aria-label="Remove from initiative"
                              icon={<Icon.Trash boxSize="14px" />}
                              size="sm"
                              variant="ghost"
                              colorScheme="red"
                              onClick={() => handleRemove(entry.tokenId)}
                            />
                          </Tooltip>
                        </HStack>
                      </Flex>
                    )}
                  </InitiativeListItem>
                ))}
              </List>
            )}
          </VStack>
        </Box>
      }
      options={[
        {
          onClick: handleAdvance,
          title: "Next Turn",
          icon: <Icon.ChevronRight boxSize="16px" />,
          isDisabled: !isInCombat,
        },
      ]}
    />
  );
};
