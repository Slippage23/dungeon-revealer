import * as React from "react";
import {
  createPlugin,
  useInputContext,
  Components as LevaComponents,
} from "leva/plugin";
import { Wrap, WrapItem, Badge, Tooltip } from "@chakra-ui/react";

const { Row, Label } = LevaComponents;

const CONDITIONS = [
  { name: "blinded", label: "Blinded", color: "gray" },
  { name: "charmed", label: "Charmed", color: "pink" },
  { name: "deafened", label: "Deafened", color: "gray" },
  { name: "exhausted", label: "Exhausted", color: "yellow" },
  { name: "frightened", label: "Frightened", color: "purple" },
  { name: "grappled", label: "Grappled", color: "orange" },
  { name: "incapacitated", label: "Incapacitated", color: "red" },
  { name: "invisible", label: "Invisible", color: "blue" },
  { name: "paralyzed", label: "Paralyzed", color: "purple" },
  { name: "petrified", label: "Petrified", color: "gray" },
  { name: "poisoned", label: "Poisoned", color: "green" },
  { name: "prone", label: "Prone", color: "orange" },
  { name: "restrained", label: "Restrained", color: "red" },
  { name: "stunned", label: "Stunned", color: "yellow" },
  { name: "unconscious", label: "Unconscious", color: "purple" },
];

const ConditionsPicker = () => {
  const context: any = useInputContext<any>();
  const { displayValue, setValue } = context;

  // Handle different value structures - displayValue might be wrapped or unwrapped
  const getSelectedConditions = (): string[] => {
    if (Array.isArray(displayValue)) {
      return displayValue;
    } else if (
      displayValue &&
      typeof displayValue === "object" &&
      Array.isArray(displayValue.value)
    ) {
      return displayValue.value;
    }
    return [];
  };

  const selectedConditions = getSelectedConditions();

  const handleToggle = (conditionName: string) => {
    const newConditions = selectedConditions.includes(conditionName)
      ? selectedConditions.filter((c) => c !== conditionName)
      : [...selectedConditions, conditionName];
    // Normalize to lowercase (matching enum values) before saving
    const normalized = newConditions.map((c) => c.toLowerCase());
    setValue(normalized);
  };

  return (
    <Row input>
      <Label>Conditions</Label>
      <Wrap spacing={1}>
        {CONDITIONS.map((condition: typeof CONDITIONS[0]) => {
          const isActive = selectedConditions.includes(condition.name);
          return (
            <WrapItem key={condition.name}>
              <Tooltip label={condition.label}>
                <Badge
                  colorScheme={isActive ? condition.color : "gray"}
                  variant={isActive ? "solid" : "outline"}
                  cursor="pointer"
                  onClick={() => handleToggle(condition.name)}
                  fontSize="xs"
                  px={2}
                  py={1}
                  userSelect="none"
                >
                  {condition.label}
                </Badge>
              </Tooltip>
            </WrapItem>
          );
        })}
      </Wrap>
    </Row>
  );
};

const normalize = (input: { value: string[] }) => ({
  value: Array.isArray(input.value) ? input.value : [],
});

export const levaPluginConditions = createPlugin({
  normalize,
  component: ConditionsPicker,
});
