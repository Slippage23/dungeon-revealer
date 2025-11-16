import * as React from "react";
import * as THREE from "three";
import { useFragment } from "relay-hooks";
import graphql from "babel-plugin-relay/macro";

// NOTE: This import will resolve after a successful relay-compiler run.
type TokenConditionIcon_tokenData$key = any;

const Fragment = graphql`
  fragment TokenConditionIcon_tokenData on TokenData {
    conditions
  }
`;

interface TokenConditionIconProps {
  tokenData: TokenConditionIcon_tokenData$key;
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
 * Renders condition text labels in a row above the health bar.
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

  // Match the health bar dimensions
  const barWidth = initialRadius * 1.8; // Same as health bar
  const barHeight = initialRadius * 0.15; // Same as health bar
  const topOffset = initialRadius * 1.1; // Where health bar is positioned

  // Position directly above the health bar
  const verticalOffset = topOffset + barHeight / 2 + barHeight * 0.4; // Just above health bar

  console.log("[TokenConditionIcon] Rendering conditions:", conditions);

  return (
    <group
      position={[0, verticalOffset, 0]}
      rotation={[0, 0, 0]}
      renderOrder={99}
    >
      {conditions.map((conditionEnum: string, index: number) => {
        // Ensure condition enum is lowercase for lookup
        const conditionKey = conditionEnum.toLowerCase();
        const config =
          CONDITION_CONFIG[conditionKey] || CONDITION_CONFIG["poisoned"]; // Default fallback

        const displayText = config.fullName;

        // Create canvas texture for text - sized for full bar width
        const canvas = document.createElement("canvas");
        canvas.width = 512; // Higher resolution for better text quality
        canvas.height = 128;
        const ctx = canvas.getContext("2d");
        if (!ctx) return null;

        // Clear canvas and draw text
        ctx.fillStyle = config.color as string;
        ctx.font = "bold 72px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(displayText, 256, 64);

        const texture = new THREE.CanvasTexture(canvas);
        texture.magFilter = THREE.LinearFilter;
        texture.minFilter = THREE.LinearFilter;

        // Scale text to match health bar width
        const textWidth = barWidth;
        const textHeight = barHeight * 1.5;
        const verticalSpacing = textHeight * 1.3;

        return (
          <mesh
            key={`${conditionEnum}-${index}`}
            position={[0, index * verticalSpacing, 0.01]}
          >
            <planeBufferGeometry
              attach="geometry"
              args={[textWidth, textHeight]}
            />
            <meshBasicMaterial
              attach="material"
              map={texture}
              transparent
              depthWrite={false}
            />
          </mesh>
        );
      })}
    </group>
  );
};
