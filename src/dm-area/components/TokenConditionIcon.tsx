import * as React from "react";
import * as THREE from "three";
import { useFragment } from "relay-hooks";
import graphql from "babel-plugin-relay/macro";

// NOTE: This import will resolve after a successful relay-compiler run.
type mapView_TokenConditionIcon_conditions$key = any;

const Fragment = graphql`
  fragment TokenConditionIcon_conditions on TokenData {
    conditions
  }
`;

interface TokenConditionIconProps {
  tokenData: mapView_TokenConditionIcon_conditions$key;
  initialRadius: number; // The 3D radius of the token
  healthBarPresent: boolean; // Whether health bar is rendered (affects vertical offset)
}

/**
 * Maps condition enum values (uppercase) to display configs (lowercase).
 * Abbreviations are used for space-constrained icon rendering.
 */
const CONDITION_CONFIG: Record<
  string,
  { color: THREE.Color | string; abbreviation: string; fullName: string }
> = {
  blinded: {
    color: "#808080", // Gray
    abbreviation: "B",
    fullName: "Blinded",
  },
  charmed: {
    color: "#FF69B4", // Hot Pink
    abbreviation: "C",
    fullName: "Charmed",
  },
  deafened: {
    color: "#4B0082", // Indigo
    abbreviation: "D",
    fullName: "Deafened",
  },
  exhausted: {
    color: "#696969", // Dim Gray
    abbreviation: "E",
    fullName: "Exhausted",
  },
  frightened: {
    color: "#FF6347", // Tomato
    abbreviation: "F",
    fullName: "Frightened",
  },
  grappled: {
    color: "#8B4513", // Saddle Brown
    abbreviation: "G",
    fullName: "Grappled",
  },
  incapacitated: {
    color: "#DC143C", // Crimson
    abbreviation: "I",
    fullName: "Incapacitated",
  },
  invisible: {
    color: "#87CEEB", // Sky Blue
    abbreviation: "V",
    fullName: "Invisible",
  },
  paralyzed: {
    color: "#FFD700", // Gold
    abbreviation: "P",
    fullName: "Paralyzed",
  },
  petrified: {
    color: "#A9A9A9", // Dark Gray
    abbreviation: "Pe",
    fullName: "Petrified",
  },
  poisoned: {
    color: "#228B22", // Forest Green
    abbreviation: "Po",
    fullName: "Poisoned",
  },
  prone: {
    color: "#8B7355", // Burlywood4
    abbreviation: "Pr",
    fullName: "Prone",
  },
  restrained: {
    color: "#FF8C00", // Dark Orange
    abbreviation: "R",
    fullName: "Restrained",
  },
  stunned: {
    color: "#FFD700", // Gold
    abbreviation: "S",
    fullName: "Stunned",
  },
  unconscious: {
    color: "#000000", // Black
    abbreviation: "U",
    fullName: "Unconscious",
  },
};

/**
 * Renders condition indicator icons in a row below (or above) the token.
 * Each condition gets a small circle with an abbreviation.
 */
export const TokenConditionIcon: React.FC<TokenConditionIconProps> = ({
  tokenData: tokenDataKey,
  initialRadius,
  healthBarPresent,
}) => {
  const tokenData = useFragment(Fragment, tokenDataKey);

  if (!tokenData.conditions || tokenData.conditions.length === 0) {
    return null;
  }

  const conditions = tokenData.conditions;
  const iconSize = initialRadius * 0.4; // Each condition icon diameter
  const spacing = iconSize * 0.2; // Gap between icons
  const rowHeight = iconSize * 1.2; // Total height of condition row

  // Vertical offset: below health bar if present, otherwise directly below token
  const verticalOffset = healthBarPresent
    ? initialRadius * 1.4 // Below health bar
    : initialRadius * 0.6; // Below token, less offset

  // Position icons in a centered row
  const totalRowWidth =
    conditions.length * iconSize + (conditions.length - 1) * spacing;
  const startX = -totalRowWidth / 2;

  return (
    <group
      position={[0, -verticalOffset, 0]}
      rotation={[0, 0, 0]}
      renderOrder={99}
    >
      {conditions.map((conditionEnum: string, index: number) => {
        const config =
          CONDITION_CONFIG[conditionEnum.toLowerCase()] ||
          CONDITION_CONFIG["poisoned"]; // Default fallback

        const xPos = startX + index * (iconSize + spacing) + iconSize / 2;

        return (
          <group key={`${conditionEnum}-${index}`} position={[xPos, 0, 0]}>
            {/* Colored circle indicating the condition */}
            <mesh position={[0, 0, -0.01]}>
              <circleBufferGeometry
                attach="geometry"
                args={[iconSize / 2, 16]}
              />
              <meshBasicMaterial
                attach="material"
                color={config.color}
                opacity={0.95}
                transparent
              />
            </mesh>

            {/* Border ring for better visibility */}
            <mesh position={[0, 0, 0]}>
              <circleBufferGeometry
                attach="geometry"
                args={[iconSize / 2, 16]}
              />
              <meshBasicMaterial attach="material" color="black" wireframe />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};
