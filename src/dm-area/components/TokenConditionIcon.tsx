import * as React from "react";
import * as THREE from "three";
import { useFragment } from "relay-hooks";
import graphql from "babel-plugin-relay/macro";
import { Text } from "@react-three/drei";
import * as Icon from "../../feather-icons"; // Assume feather-icons provides SVG components or references

// This fragment must be queried from the `tokenData.conditions` field.
const ConditionFragment = graphql`
  fragment TokenConditionIcon_condition on TokenCondition {
    id
    icon # e.g., "zap-off" for exhausted, "heart" for charmed
    color # e.g., "#FF0000"
  }
`;

interface TokenConditionIconProps {
  condition: any; // Use the generated Fragment$key type here: TokenConditionIcon_condition$key
  index: number; // For positioning (0, 1, 2, ...)
  initialRadius: number; // The 3D radius of the token
}

/**
 * Renders a small, 3D icon for a token condition above the token.
 * Since rendering Feather icons directly in R3F is complex, we use a colored sphere
 * as a placeholder for the visual badge.
 */
export const TokenConditionIcon: React.FC<TokenConditionIconProps> = ({
  condition: conditionKey,
  index,
  initialRadius,
}) => {
  const condition = useFragment(ConditionFragment, conditionKey);
  
  // Icon dimensions relative to the token size
  const iconSize = initialRadius * 0.4;
  const spacing = initialRadius * 0.1;
  
  // Position the icons above the token and stack them horizontally.
  // We start from the token's top-right edge (initialRadius), moving outwards.
  const baseX = initialRadius + spacing;
  const offsetX = iconSize * index; 
  
  // Y-position is fixed above the token/health bar
  const yPos = initialRadius * 1.5;
  
  // Z-position (in front of the token and map)
  const zPos = 0; 

  const iconColor = condition.color || "#ffffff";
  const backgroundColor = "#000000";

  return (
    <group position={[baseX + offsetX, yPos, zPos]}>
      {/* 1. Background Circle/Badge */}
      <mesh position={[0, 0, 0]}>
        <circleBufferGeometry args={[iconSize / 2, 16]} />
        <meshBasicMaterial color={backgroundColor} />
      </mesh>
      
      {/* 2. Icon Placeholder (Using a standard colored plane/Text if available) */}
      <mesh position={[0, 0, 0.01]}> 
        <planeBufferGeometry args={[iconSize * 0.8, iconSize * 0.8]} />
        <meshBasicMaterial color={iconColor} />
      </mesh>
      
      {/* NOTE: You would replace the placeholder mesh above with an actual R3F icon rendering solution. 
          For now, the colored square/circle serves as a visual indicator.
      */}
      
    </group>
  );
};