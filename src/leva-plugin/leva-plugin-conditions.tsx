import * as React from "react";
import {
  createPlugin,
  useInputContext,
  Components as LevaComponents,
} from "leva/plugin";
import { Wrap, WrapItem, Badge, Tooltip } from "@chakra-ui/react";

const { Row, Label } = LevaComponents;

const CONDITIONS = [
  { name: "BLINDED", label: "Blinded", color: "gray" },
  { name: "CHARMED", label: "Charmed", color: "pink" },
  { name: "DEAFENED", label: "Deafened", color: "gray" },
  { name: "EXHAUSTED", label: "Exhausted", color: "yellow" },
  { name: "FRIGHTENED", label: "Frightened", color: "purple" },
  { name: "GRAPPLED", label: "Grappled", color: "orange" },
  { name: "INCAPACITATED", label: "Incapacitated", color: "red" },
  { name: "INVISIBLE", label: "Invisible", color: "blue" },
  { name: "PARALYZED", label: "Paralyzed", color: "purple" },
  { name: "PETRIFIED", label: "Petrified", color: "gray" },
  { name: "POISONED", label: "Poisoned", color: "green" },
  { name: "PRONE", label: "Prone", color: "orange" },
  { name: "RESTRAINED", label: "Restrained", color: "red" },
  { name: "STUNNED", label: "Stunned", color: "yellow" },
  { name: "UNCONSCIOUS", label: "Unconscious", color: "purple" },
];

const ConditionsPicker = () => {
  const context: any = useInputContext<any>();
  const { displayValue, onUpdate } = context;

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
    onUpdate(newConditions);
    // Trigger onEditEnd callback if available in context
    if (context.onEditEnd && typeof context.onEditEnd === "function") {
      context.onEditEnd(newConditions);
    }
  };

  return (
    <Row input>
      <Label>Conditions</Label>
      <Wrap spacing={1}>
        {CONDITIONS.map((condition) => {
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
