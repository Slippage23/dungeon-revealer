# Canvas Drawing Utilities & Text Rendering

## Overview

Dungeon Revealer uses HTML Canvas APIs extensively for map rendering, grid overlays, and text labels. These utilities abstract common drawing patterns used across DM and player map views.

## Text Rendering Patterns

### 1. Canvas Text Utilities (src/canvas-text.tsx)

The `canvasText` module provides structured text rendering on canvas:

```typescript
// Backend utility for measuring text without drawing
export interface CanvasTextMeasurements {
  width: number;
  height: number;
  baseline: number;
}

export const measureText = (
  context: CanvasRenderingContext2D,
  text: string,
  options: {
    fontSize: number;
    fontFamily: string;
    fontWeight?: string;
  }
): CanvasTextMeasurements => {
  context.font = `${options.fontWeight || "400"} ${options.fontSize}px ${
    options.fontFamily
  }`;
  const metrics = context.measureText(text);

  return {
    width: metrics.width,
    height: options.fontSize,
    baseline: metrics.fontBoundingBoxAscent,
  };
};
```

### 2. Drawing Text with Background

Common pattern for HP labels, token names, condition text:

```typescript
export const drawTextWithBackground = (
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  options: {
    fontSize: number;
    fontFamily: string;
    textColor: string;
    backgroundColor: string;
    padding: number;
    borderRadius: number;
    borderColor?: string;
    borderWidth?: number;
  }
): void => {
  // Measure text first
  const measurements = measureText(context, text, options);

  // Draw background
  const bgWidth = measurements.width + options.padding * 2;
  const bgHeight = measurements.height + options.padding * 2;
  const bgX = x - bgWidth / 2;
  const bgY = y - bgHeight / 2;

  context.fillStyle = options.backgroundColor;
  context.beginPath();
  context.roundRect(bgX, bgY, bgWidth, bgHeight, options.borderRadius);
  context.fill();

  // Draw border if specified
  if (options.borderColor && options.borderWidth) {
    context.strokeStyle = options.borderColor;
    context.lineWidth = options.borderWidth;
    context.stroke();
  }

  // Draw text
  context.fillStyle = options.textColor;
  context.font = `400 ${options.fontSize}px ${options.fontFamily}`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, x, y);
};
```

## Drawing Utilities (src/canvas-draw-utilities.tsx)

### 1. Circle Drawing with Fill & Stroke

```typescript
export const drawCircle = (
  context: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  options: {
    fillColor?: string;
    strokeColor?: string;
    lineWidth?: number;
  }
): void => {
  context.beginPath();
  context.arc(centerX, centerY, radius, 0, Math.PI * 2);

  if (options.fillColor) {
    context.fillStyle = options.fillColor;
    context.fill();
  }

  if (options.strokeColor && options.lineWidth) {
    context.strokeStyle = options.strokeColor;
    context.lineWidth = options.lineWidth;
    context.stroke();
  }
};
```

### 2. Rectangle Drawing with Rounded Corners

```typescript
export const drawRoundedRectangle = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  options: {
    fillColor?: string;
    strokeColor?: string;
    lineWidth?: number;
  }
): void => {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(
    x + width,
    y + height,
    x + width - radius,
    y + height
  );
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();

  if (options.fillColor) {
    context.fillStyle = options.fillColor;
    context.fill();
  }

  if (options.strokeColor && options.lineWidth) {
    context.strokeStyle = options.strokeColor;
    context.lineWidth = options.lineWidth;
    context.stroke();
  }
};
```

### 3. Grid Line Drawing

Pattern used in `src/map-view.tsx` for grid overlay:

```typescript
export const drawGrid = (
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  gridSize: number,
  options: {
    lineColor: string;
    lineWidth: number;
    opacity: number;
  }
): void => {
  context.save();
  context.globalAlpha = options.opacity;
  context.strokeStyle = options.lineColor;
  context.lineWidth = options.lineWidth;

  // Vertical lines
  for (let x = 0; x < width; x += gridSize) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, height);
    context.stroke();
  }

  // Horizontal lines
  for (let y = 0; y < height; y += gridSize) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  }

  context.restore();
};
```

### 4. Fog-of-War Rendering

Pattern for dynamic fog updates (used in DM area):

```typescript
export const drawFogOfWar = (
  context: CanvasRenderingContext2D,
  mapWidth: number,
  mapHeight: number,
  fogAreas: Array<{ x: number; y: number; radius: number }>,
  options: {
    fillColor: string;
    opacity: number;
  }
): void => {
  // Fill entire canvas with fog
  context.fillStyle = options.fillColor;
  context.globalAlpha = options.opacity;
  context.fillRect(0, 0, mapWidth, mapHeight);

  // Clear fog areas (using "destination-out" composite)
  context.globalCompositeOperation = "destination-out";
  context.globalAlpha = 1;

  fogAreas.forEach((area) => {
    context.beginPath();
    context.arc(area.x, area.y, area.radius, 0, Math.PI * 2);
    context.fill();
  });

  // Reset composite operation
  context.globalCompositeOperation = "source-over";
  context.globalAlpha = 1;
};
```

## Token Rendering on Canvas

### 1. HP Bar Rendering Above Token

```typescript
export const drawHealthBar = (
  context: CanvasRenderingContext2D,
  tokenX: number,
  tokenY: number,
  tokenRadius: number,
  currentHP: number,
  maxHP: number,
  options: {
    barWidth: number;
    barHeight: number;
    backgroundColor: string;
    healthColor: string;
    damageColor: string;
  }
): void => {
  const hpPercent = Math.max(0, Math.min(1, currentHP / maxHP));
  const barX = tokenX - options.barWidth / 2;
  const barY = tokenY - tokenRadius - 15; // Above token

  // Background bar
  context.fillStyle = options.backgroundColor;
  context.fillRect(barX, barY, options.barWidth, options.barHeight);

  // Health fill (green -> red gradient)
  const gradient = context.createLinearGradient(
    barX,
    0,
    barX + options.barWidth,
    0
  );
  gradient.addColorStop(0, options.healthColor);
  gradient.addColorStop(hpPercent, options.healthColor);
  gradient.addColorStop(hpPercent, options.damageColor);
  gradient.addColorStop(1, options.damageColor);

  context.fillStyle = gradient;
  context.fillRect(barX, barY, options.barWidth * hpPercent, options.barHeight);

  // Border
  context.strokeStyle = "#000";
  context.lineWidth = 1;
  context.strokeRect(barX, barY, options.barWidth, options.barHeight);

  // HP text
  context.fillStyle = "#fff";
  context.font = "bold 10px Arial";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(
    `${currentHP}/${maxHP}`,
    tokenX,
    barY + options.barHeight / 2
  );
};
```

### 2. Condition Icons Below Token

```typescript
export const drawConditionIcons = (
  context: CanvasRenderingContext2D,
  tokenX: number,
  tokenY: number,
  tokenRadius: number,
  conditions: Array<{ name: string; color: string }>,
  options: {
    iconSize: number;
    spacing: number;
  }
): void => {
  const totalWidth = conditions.length * (options.iconSize + options.spacing);
  const startX = tokenX - totalWidth / 2;
  const startY = tokenY + tokenRadius + 8;

  conditions.forEach((condition, index) => {
    const x = startX + index * (options.iconSize + options.spacing);
    const y = startY;

    // Draw colored circle for condition
    context.fillStyle = condition.color;
    context.beginPath();
    context.arc(x, y, options.iconSize / 2, 0, Math.PI * 2);
    context.fill();

    // Draw condition name on hover (omitted for brevity)
  });
};
```

### 3. Selection Highlight (Outline)

```typescript
export const drawSelectionHighlight = (
  context: CanvasRenderingContext2D,
  tokenX: number,
  tokenY: number,
  tokenRadius: number,
  options: {
    lineColor: string;
    lineWidth: number;
    dashPattern?: number[];
  }
): void => {
  context.save();

  if (options.dashPattern) {
    context.setLineDash(options.dashPattern);
  }

  context.strokeStyle = options.lineColor;
  context.lineWidth = options.lineWidth;
  context.beginPath();
  context.arc(tokenX, tokenY, tokenRadius + 5, 0, Math.PI * 2);
  context.stroke();

  context.restore();
};
```

## Integration with Three.js Canvas Textures

### 1. Update Canvas & Refresh Texture

Pattern used in `src/map-view.tsx`:

```tsx
const MapRenderer = () => {
  const [mapCanvas] = React.useState(() => {
    const canvas = document.createElement("canvas");
    canvas.width = mapWidth;
    canvas.height = mapHeight;
    return canvas;
  });

  const [mapTexture] = React.useState(() => new THREE.CanvasTexture(mapCanvas));

  // Update canvas and mark texture for re-render
  const updateMapDisplay = (mapImage: HTMLImageElement) => {
    const context = mapCanvas.getContext("2d")!;

    // Clear
    context.clearRect(0, 0, mapCanvas.width, mapCanvas.height);

    // Draw map image
    context.drawImage(mapImage, 0, 0, mapCanvas.width, mapCanvas.height);

    // Draw grid overlay
    drawGrid(context, mapCanvas.width, mapCanvas.height, gridSize, {
      lineColor: "#ccc",
      lineWidth: 1,
      opacity: 0.5,
    });

    // **CRITICAL**: Mark texture as needing update
    mapTexture.needsUpdate = true;
  };

  return (
    <Canvas>
      <mesh>
        <planeGeometry args={[mapWidth, mapHeight]} />
        <meshStandardMaterial map={mapTexture} />
      </mesh>
    </Canvas>
  );
};
```

### 2. Layered Canvas Approach

Multiple canvases for different rendering layers:

```tsx
const MapWithLayers = () => {
  const [baseCanvas] = React.useState(() => createCanvas(width, height));
  const [gridCanvas] = React.useState(() => createCanvas(width, height));
  const [tokenCanvas] = React.useState(() => createCanvas(width, height));
  const [fogCanvas] = React.useState(() => createCanvas(width, height));

  const [baseTexture] = React.useState(
    () => new THREE.CanvasTexture(baseCanvas)
  );
  const [gridTexture] = React.useState(
    () => new THREE.CanvasTexture(gridCanvas)
  );
  const [tokenTexture] = React.useState(
    () => new THREE.CanvasTexture(tokenCanvas)
  );
  const [fogTexture] = React.useState(() => new THREE.CanvasTexture(fogCanvas));

  // When tokens change, update only tokenCanvas
  const updateTokens = (tokens: Token[]) => {
    const ctx = tokenCanvas.getContext("2d")!;
    ctx.clearRect(0, 0, tokenCanvas.width, tokenCanvas.height);

    tokens.forEach((token) => {
      drawCircle(ctx, token.x, token.y, token.radius, {
        fillColor: token.color,
        strokeColor: "#000",
        lineWidth: 2,
      });

      drawTextWithBackground(ctx, token.name, token.x, token.y, {
        fontSize: 12,
        fontFamily: "Arial",
        textColor: "#fff",
        backgroundColor: "#000",
        padding: 4,
        borderRadius: 2,
      });
    });

    tokenTexture.needsUpdate = true;
  };

  return (
    <Canvas>
      <mesh renderOrder={0}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial map={baseTexture} />
      </mesh>

      <mesh renderOrder={1}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial map={gridTexture} transparent />
      </mesh>

      <mesh renderOrder={2}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial map={tokenTexture} transparent />
      </mesh>

      <mesh renderOrder={3}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial map={fogTexture} transparent />
      </mesh>
    </Canvas>
  );
};
```

## Performance Optimization

### 1. Batch Canvas Updates

Instead of updating canvas on every frame, batch changes:

```typescript
let pendingUpdates = new Set<"tokens" | "grid" | "fog">();

const scheduleUpdate = (type: "tokens" | "grid" | "fog") => {
  pendingUpdates.add(type);
  requestAnimationFrame(() => {
    if (pendingUpdates.has("tokens")) {
      updateTokenCanvas();
    }
    if (pendingUpdates.has("grid")) {
      updateGridCanvas();
    }
    if (pendingUpdates.has("fog")) {
      updateFogCanvas();
    }
    pendingUpdates.clear();
  });
};
```

### 2. Offscreen Canvas for Expensive Operations

Use OffscreenCanvas for heavy drawing operations:

```typescript
const renderTokensOffscreen = async (tokens: Token[]): Promise<ImageData> => {
  const offscreen = new OffscreenCanvas(width, height);
  const ctx = offscreen.getContext("2d")!;

  tokens.forEach((token) => {
    drawCircle(ctx, token.x, token.y, token.radius, { ... });
  });

  return ctx.getImageData(0, 0, width, height);
};

// Main thread can continue while offscreen rendering happens
const imageData = await renderTokensOffscreen(tokens);
const mainCanvas = document.querySelector("canvas");
const mainCtx = mainCanvas!.getContext("2d")!;
mainCtx.putImageData(imageData, 0, 0);
```

## Common Patterns

### Coordinate Scaling

Canvas drawing uses pixel coordinates; map uses logical coordinates:

```typescript
const mapToCanvasCoords = (mapX: number, mapY: number) => {
  const canvasX = mapX * scale;
  const canvasY = mapY * scale;
  return { canvasX, canvasY };
};

const canvasToMapCoords = (canvasX: number, canvasY: number) => {
  const mapX = canvasX / scale;
  const mapY = canvasY / scale;
  return { mapX, mapY };
};
```

### Clear Canvas Safely

```typescript
const clearCanvas = (canvas: HTMLCanvasElement): void => {
  const context = canvas.getContext("2d");
  if (!context) return;

  context.clearRect(0, 0, canvas.width, canvas.height);
};
```

### Reset Canvas State After Drawing

```typescript
const withCanvasState = (
  context: CanvasRenderingContext2D,
  fn: (ctx: CanvasRenderingContext2D) => void
): void => {
  context.save();
  try {
    fn(context);
  } finally {
    context.restore();
  }
};

// Usage
withCanvasState(context, (ctx) => {
  ctx.globalAlpha = 0.5;
  drawCircle(ctx, 100, 100, 50, { fillColor: "red" });
});
// Automatically restores globalAlpha
```
