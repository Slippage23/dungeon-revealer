import * as React from "react";
import * as THREE from "three";
import { useFragment } from "relay-hooks";
import graphql from "babel-plugin-relay/macro";
// NOTE: This import will resolve after a successful relay-compiler run.
// During development or in CI environments where the relay compiler hasn't run yet,
// provide a local fallback type to prevent TypeScript from erroring on the missing module.
type mapView_TokenHealthBar_tokenData$key = any;

// Fragment is co-located with component; Relay will resolve this at runtime
const Fragment = graphql`
  fragment TokenHealthBar_tokenData on TokenData {
    currentHp
    maxHp
    tempHp
  }
`;

interface TokenHealthBarProps {
  tokenData: any;
  initialRadius: number; // The 3D radius of the token
}

/**
 * Renders a small 3D health bar above a token in the R3F environment.
 */
export const TokenHealthBar: React.FC<TokenHealthBarProps> = ({
  tokenData: tokenDataKey,
  initialRadius,
}) => {
  const tokenData = useFragment(Fragment, tokenDataKey);

  const { currentHp, maxHp, tempHp } = tokenData;

  if (!maxHp || maxHp <= 0) {
    return null;
  }

  // Use Math.max(0, ...) to handle negative HP gracefully if data is inconsistent
  const currentHpValue = Math.max(0, currentHp || 0);
  const tempHpValue = Math.max(0, tempHp || 0);

  const effectiveMaxHp = maxHp + tempHpValue;

  if (effectiveMaxHp <= 0) {
    return null;
  }

  // Color should be based on current HP vs MAX HP, not counting temp HP
  const colorPercentage = Math.max(0, (currentHpValue / maxHp) * 100);
  let color = new THREE.Color("green");
  if (colorPercentage <= 50) color.set("yellow");
  if (colorPercentage <= 20) color.set("red");

  const barHeight = initialRadius * 0.15;
  const barWidth = initialRadius * 1.8;
  const topOffset = initialRadius * 1.1;

  const position: [number, number, number] = [0, topOffset, 0];

  // Calculate bar segment widths and positions
  const mainHpBarWidth = barWidth * (currentHpValue / effectiveMaxHp);
  const mainHpBarX = -barWidth / 2 + mainHpBarWidth / 2;

  const tempHpBarWidth = barWidth * (tempHpValue / effectiveMaxHp);
  const tempHpBarStart = -barWidth / 2 + mainHpBarWidth;
  const tempHpBarX = tempHpBarStart + tempHpBarWidth / 2;

  return (
    <group position={position} rotation={[0, 0, 0]} renderOrder={100}>
      {/* 1. Used HP Area (left side, filled with black) */}
      {currentHpValue < maxHp && (
        <mesh
          position={[
            -barWidth / 2 + (barWidth * currentHpValue) / maxHp / 2,
            0,
            0,
          ]}
        >
          <planeBufferGeometry
            attach="geometry"
            args={[barWidth * (currentHpValue / maxHp), barHeight]}
          />
          <meshBasicMaterial attach="material" color="black" />
        </mesh>
      )}

      {/* 2. Main HP Bar (Current HP) - colored portion */}
      {currentHpValue > 0 && (
        <mesh position={[mainHpBarX, 0, 0.01]}>
          <planeBufferGeometry
            attach="geometry"
            args={[mainHpBarWidth, barHeight]}
          />
          <meshBasicMaterial attach="material" color={color} />
        </mesh>
      )}

      {/* 3. Temporary HP Bar (Temp HP) */}
      {tempHpValue > 0 && (
        <mesh position={[tempHpBarX, 0, 0.01]}>
          <planeBufferGeometry
            attach="geometry"
            args={[tempHpBarWidth, barHeight]}
          />
          <meshBasicMaterial attach="material" color={"#4299E1"} />
        </mesh>
      )}

      {/* Note: HP text label rendering removed to avoid @react-three/drei dependency */}
      {/* Text labels can be added via canvas-based rendering in future if needed */}
    </group>
  );
};
