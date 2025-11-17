/**
 * Token Stats Panel Component
 * Displays and edits token HP, conditions, and combat stats
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
  Textarea,
  Button,
  Progress,
  Badge,
  Wrap,
  WrapItem,
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
} from "@chakra-ui/react";
import { DraggableWindow } from "../draggable-window";
import * as Icon from "../feather-icons";
import * as CustomButton from "../button";

// GraphQL Queries and Mutations
const TokenStatsPanel_TokenDataQuery = graphql`
  query tokenStatsPanelTokenDataQuery($tokenId: String!) {
    tokenData(tokenId: $tokenId) {
      id
      tokenId
      mapId
      currentHp
      maxHp
      tempHp
      armorClass
      speed
      initiativeModifier
      conditions
      notes
    }
  }
`;

const TokenStatsPanel_UpsertMutation = graphql`
  mutation tokenStatsPanelUpsertMutation($input: TokenDataInput!) {
    upsertTokenData(input: $input) {
      id
      tokenId
      currentHp
      maxHp
      tempHp
      armorClass
      speed
      initiativeModifier
      conditions
      notes
    }
  }
`;

const TokenStatsPanel_ApplyDamageMutation = graphql`
  mutation tokenStatsPanelApplyDamageMutation($input: ApplyDamageInput!) {
    applyDamage(input: $input) {
      id
      currentHp
      tempHp
    }
  }
`;

const TokenStatsPanel_ToggleConditionMutation = graphql`
  mutation tokenStatsPanelToggleConditionMutation(
    $input: ToggleConditionInput!
  ) {
    toggleCondition(input: $input) {
      id
      conditions
    }
  }
`;

// Condition definitions with icons and colors
const CONDITIONS = [
  { name: "BLINDED", label: "Blinded", color: "gray", icon: "👁️" },
  { name: "CHARMED", label: "Charmed", color: "pink", icon: "💖" },
  { name: "DEAFENED", label: "Deafened", color: "gray", icon: "🔇" },
  { name: "EXHAUSTED", label: "Exhausted", color: "yellow", icon: "😓" },
  { name: "FRIGHTENED", label: "Frightened", color: "purple", icon: "😨" },
  { name: "GRAPPLED", label: "Grappled", color: "orange", icon: "🤝" },
  { name: "INCAPACITATED", label: "Incapacitated", color: "red", icon: "💫" },
  { name: "INVISIBLE", label: "Invisible", color: "cyan", icon: "👻" },
  { name: "PARALYZED", label: "Paralyzed", color: "blue", icon: "🧊" },
  { name: "PETRIFIED", label: "Petrified", color: "gray", icon: "🗿" },
  { name: "POISONED", label: "Poisoned", color: "green", icon: "🤢" },
  { name: "PRONE", label: "Prone", color: "orange", icon: "⬇️" },
  { name: "RESTRAINED", label: "Restrained", color: "orange", icon: "⛓️" },
  { name: "STUNNED", label: "Stunned", color: "yellow", icon: "💫" },
  { name: "UNCONSCIOUS", label: "Unconscious", color: "red", icon: "😵" },
  { name: "CONCENTRATING", label: "Concentrating", color: "blue", icon: "🧠" },
  { name: "BLESSED", label: "Blessed", color: "yellow", icon: "✨" },
  { name: "CURSED", label: "Cursed", color: "purple", icon: "🌑" },
  { name: "HASTED", label: "Hasted", color: "green", icon: "⚡" },
  { name: "SLOWED", label: "Slowed", color: "blue", icon: "🐢" },
  { name: "RAGING", label: "Raging", color: "red", icon: "😡" },
];

const HPBarContainer = styled.div`
  position: relative;
  height: 24px;
  background-color: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  margin: 8px 0;
`;

const HPBarFill = styled.div<{ percentage: number; isLowHp: boolean }>`
  position: absolute;
  height: 100%;
  background-color: ${(props) => (props.isLowHp ? "#f56565" : "#48bb78")};
  width: ${(props) => props.percentage}%;
  transition: width 0.3s ease, background-color 0.3s ease;
`;

const HPBarText = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  color: #2d3748;
  z-index: 1;
`;

interface TokenStatsPanelProps {
  tokenId: string;
  mapId: string;
  onClose: () => void;
}

export const TokenStatsPanel: React.FC<TokenStatsPanelProps> = ({
  tokenId,
  mapId,
  onClose,
}) => {
  const toast = useToast();

  // Query token data
  const { data, error } = useQuery<any>(
    TokenStatsPanel_TokenDataQuery,
    { tokenId },
    { fetchPolicy: "store-and-network" }
  );

  // Mutations
  const [upsertTokenData] = useMutation<any>(TokenStatsPanel_UpsertMutation);
  const [applyDamage] = useMutation<any>(TokenStatsPanel_ApplyDamageMutation);
  const [toggleCondition] = useMutation<any>(
    TokenStatsPanel_ToggleConditionMutation
  );

  // Local state for form inputs
  const [currentHp, setCurrentHp] = React.useState<number | null>(null);
  const [maxHp, setMaxHp] = React.useState<number | null>(null);
  const [tempHp, setTempHp] = React.useState<number>(0);
  const [armorClass, setArmorClass] = React.useState<number | null>(null);
  const [speed, setSpeed] = React.useState<number | null>(null);
  const [initiativeModifier, setInitiativeModifier] = React.useState<number>(0);
  const [notes, setNotes] = React.useState<string>("");
  const [damageAmount, setDamageAmount] = React.useState<string>("");
  const [cachedConditions, setCachedConditions] = React.useState<string[]>([]);

  // Initialize state from query data
  React.useEffect(() => {
    if (data?.tokenData) {
      setCurrentHp(data.tokenData.currentHp);
      setMaxHp(data.tokenData.maxHp);
      setTempHp(data.tokenData.tempHp || 0);
      setArmorClass(data.tokenData.armorClass);
      setSpeed(data.tokenData.speed);
      setInitiativeModifier(data.tokenData.initiativeModifier || 0);
      setNotes(data.tokenData.notes || "");
      // Convert server conditions (lowercase) to uppercase for UI consistency
      const uppercaseConditions = (data.tokenData.conditions || []).map(
        (c: string) => c.toUpperCase()
      );
      setCachedConditions(uppercaseConditions);
    }
  }, [data?.tokenData]);

  // Calculate HP percentage for visual bar
  const hpPercentage = React.useMemo(() => {
    if (!currentHp || !maxHp) return 0;
    return Math.max(0, Math.min(100, (currentHp / maxHp) * 100));
  }, [currentHp, maxHp]);

  const isLowHp = hpPercentage <= 25;

  // Save token data
  const handleSave = () => {
    upsertTokenData({
      variables: {
        input: {
          tokenId,
          mapId,
          currentHp,
          maxHp,
          tempHp,
          armorClass,
          speed,
          initiativeModifier,
          notes: notes || null,
          conditions: cachedConditions, // ✅ PRESERVE CONDITIONS
        },
      },
      onCompleted: () => {
        toast({
          title: "Token data saved",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      },
      onError: (error) => {
        toast({
          title: "Failed to save",
          description: error.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      },
    });
  };

  // Apply damage or healing
  const handleApplyDamage = (amount: number) => {
    applyDamage({
      variables: {
        input: {
          tokenId,
          amount,
        },
      },
      onCompleted: (data) => {
        setCurrentHp(data.applyDamage.currentHp);
        setTempHp(data.applyDamage.tempHp);
        setDamageAmount("");
        toast({
          title: amount > 0 ? "Damage applied" : "Healing applied",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      },
      onError: (error) => {
        toast({
          title: "Failed to apply damage",
          description: error.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      },
    });
  };

  // Toggle condition
  const handleToggleCondition = (condition: string) => {
    // Keep condition in UPPERCASE for GraphQL mutation
    // (Server will convert to lowercase for storage)
    const newConditions = cachedConditions.includes(condition)
      ? cachedConditions.filter((c) => c !== condition)
      : [...cachedConditions, condition];
    setCachedConditions(newConditions);

    toggleCondition({
      variables: {
        input: {
          tokenId,
          condition,
        },
      },
      onError: (error) => {
        toast({
          title: "Failed to toggle condition",
          description: error.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      },
    });
  };

  const conditions = data?.tokenData?.conditions || [];

  if (error) {
    return (
      <DraggableWindow
        headerContent={`Token Stats - Error`}
        close={onClose}
        onKeyDown={() => {}}
        bodyContent={
          <Box p={4}>
            <Text color="red.500">
              Failed to load token data: {error.message}
            </Text>
          </Box>
        }
      />
    );
  }

  return (
    <DraggableWindow
      headerContent={`Token Stats - ${tokenId.substring(0, 8)}`}
      close={onClose}
      onKeyDown={() => {}}
      bodyContent={
        <Box p={4} overflowY="auto" maxHeight="80vh">
          <VStack spacing={4} align="stretch">
            {/* HP Section */}
            <Box>
              <Heading size="sm" mb={2}>
                Hit Points
              </Heading>
              <HStack spacing={2} mb={2}>
                <FormControl flex={1}>
                  <FormLabel fontSize="xs">Current HP</FormLabel>
                  <NumberInput
                    value={currentHp ?? ""}
                    onChange={(valueString) =>
                      setCurrentHp(valueString ? parseInt(valueString) : null)
                    }
                    min={0}
                    max={maxHp ?? undefined}
                    size="sm"
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
                <FormControl flex={1}>
                  <FormLabel fontSize="xs">Max HP</FormLabel>
                  <NumberInput
                    value={maxHp ?? ""}
                    onChange={(valueString) =>
                      setMaxHp(valueString ? parseInt(valueString) : null)
                    }
                    min={1}
                    size="sm"
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
                <FormControl flex={1}>
                  <FormLabel fontSize="xs">Temp HP</FormLabel>
                  <NumberInput
                    value={tempHp}
                    onChange={(valueString) =>
                      setTempHp(valueString ? parseInt(valueString) : 0)
                    }
                    min={0}
                    size="sm"
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </HStack>
              {maxHp && (
                <HPBarContainer>
                  <HPBarFill percentage={hpPercentage} isLowHp={isLowHp} />
                  <HPBarText>
                    {currentHp ?? 0} / {maxHp}
                    {tempHp > 0 && ` (+${tempHp})`}
                  </HPBarText>
                </HPBarContainer>
              )}
              {/* Quick Damage/Heal */}
              <HStack mt={2}>
                <Input
                  size="sm"
                  placeholder="Amount"
                  value={damageAmount}
                  onChange={(e) => setDamageAmount(e.target.value)}
                  type="number"
                />
                <Button
                  size="sm"
                  colorScheme="red"
                  onClick={() => {
                    const amount = parseInt(damageAmount);
                    if (!isNaN(amount) && amount > 0) {
                      handleApplyDamage(amount);
                    }
                  }}
                >
                  Damage
                </Button>
                <Button
                  size="sm"
                  colorScheme="green"
                  onClick={() => {
                    const amount = parseInt(damageAmount);
                    if (!isNaN(amount) && amount > 0) {
                      handleApplyDamage(-amount);
                    }
                  }}
                >
                  Heal
                </Button>
              </HStack>
            </Box>

            <Divider />

            {/* Combat Stats */}
            <Box>
              <Heading size="sm" mb={2}>
                Combat Stats
              </Heading>
              <HStack spacing={2}>
                <FormControl flex={1}>
                  <FormLabel fontSize="xs">AC</FormLabel>
                  <NumberInput
                    value={armorClass ?? ""}
                    onChange={(valueString) =>
                      setArmorClass(valueString ? parseInt(valueString) : null)
                    }
                    min={0}
                    size="sm"
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
                <FormControl flex={1}>
                  <FormLabel fontSize="xs">Speed</FormLabel>
                  <NumberInput
                    value={speed ?? ""}
                    onChange={(valueString) =>
                      setSpeed(valueString ? parseInt(valueString) : null)
                    }
                    min={0}
                    size="sm"
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
                <FormControl flex={1}>
                  <FormLabel fontSize="xs">Initiative</FormLabel>
                  <NumberInput
                    value={initiativeModifier}
                    onChange={(valueString) =>
                      setInitiativeModifier(
                        valueString ? parseInt(valueString) : 0
                      )
                    }
                    size="sm"
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </HStack>
            </Box>

            <Divider />

            {/* Conditions */}
            <Box>
              <Heading size="sm" mb={2}>
                Conditions
              </Heading>
              <Wrap spacing={2}>
                {CONDITIONS.map((condition) => {
                  const isActive = conditions.includes(condition.name);
                  return (
                    <WrapItem key={condition.name}>
                      <Tooltip label={condition.label}>
                        <Badge
                          colorScheme={isActive ? condition.color : "gray"}
                          variant={isActive ? "solid" : "outline"}
                          cursor="pointer"
                          onClick={() => handleToggleCondition(condition.name)}
                          fontSize="sm"
                          px={2}
                          py={1}
                        >
                          {condition.icon} {condition.label}
                        </Badge>
                      </Tooltip>
                    </WrapItem>
                  );
                })}
              </Wrap>
            </Box>

            <Divider />

            {/* Notes */}
            <Box>
              <Heading size="sm" mb={2}>
                Notes
              </Heading>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this token..."
                size="sm"
                rows={4}
              />
            </Box>

            {/* Save Button */}
            <Button colorScheme="blue" onClick={handleSave} width="100%">
              Save Changes
            </Button>
          </VStack>
        </Box>
      }
      options={[
        {
          onClick: handleSave,
          title: "Save",
          icon: <Icon.Save boxSize="16px" />,
        },
      ]}
    />
  );
};
