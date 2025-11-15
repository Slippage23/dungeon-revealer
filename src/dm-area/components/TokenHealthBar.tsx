import * as React from "react";
import { Box, Progress, Text } from "@chakra-ui/react";
import { TokenData } from "../../../server/token-types";

// Note: The TokenData interface may need to be imported correctly based on your pathing.
// Assuming your folder structure has the necessary server/token-types.ts file.
interface TokenHealthBarProps {
  tokenData: TokenData;
  tokenSize: number; // The size in pixels the token is rendered at on the map
}

/**
 * Renders a small, floating health bar above a token, using token data.
 */
export const TokenHealthBar: React.FC<TokenHealthBarProps> = ({
  tokenData,
  tokenSize = 64, 
}) => {
  const { current: currentHp, max: maxHp } = tokenData.stats.hp;

  // Don't render if max HP is not valid or the token is dead
  if (maxHp <= 0 || currentHp <= 0) {
    return null; 
  }

  const healthPercentage = Math.max(0, (currentHp / maxHp) * 100);
  let colorScheme = "green";
  if (healthPercentage <= 50) colorScheme = "yellow";
  if (healthPercentage <= 20) colorScheme = "red";

  // Calculate positioning to center the bar slightly above the token
  const barWidth = tokenSize * 0.8;
  const topOffset = tokenSize * 0.1;

  return (
    // The Box acts as the container and positioning element
    <Box
      position="absolute"
      top={`-${topOffset}px`} 
      left="50%"
      transform="translateX(-50%)"
      width={`${barWidth}px`}
      zIndex={10} 
      borderRadius="sm"
      overflow="hidden"
      boxShadow="md"
      background="blackAlpha.800"
      padding="1px"
    >
      <Progress
        value={healthPercentage}
        size="xs"
        colorScheme={colorScheme}
        borderRadius="xs"
        // Ensure smooth animation for HP changes
        sx={{
          "div": { transition: "width 0.5s ease-in-out" }
        }}
      />
      <Text
        fontSize="10px"
        fontWeight="bold"
        textAlign="center"
        color="white"
        position="absolute"
        top="0"
        left="0"
        right="0"
        lineHeight="1.5"
        textShadow="1px 1px 2px black"
      >
        {currentHp} / {maxHp}
      </Text>
    </Box>
  );
};