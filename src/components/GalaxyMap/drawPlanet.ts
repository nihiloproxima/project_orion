import { Planet } from "../../models/planet";

// Helper functions
const getBiomeColor = (biome: string, alpha: number) => {
  const colors: { [key: string]: string } = {
    ocean: `rgba(65, 105, 225, ${alpha})`,
    forest: `rgba(34, 139, 34, ${alpha})`,
    ice: `rgba(176, 224, 230, ${alpha})`,
    volcanic: `rgba(139, 0, 0, ${alpha})`,
    gas: `rgba(147, 112, 219, ${alpha})`,
    terran: `rgba(100, 149, 237, ${alpha})`,
  };
  return colors[biome] || `rgba(128, 128, 128, ${alpha})`; // Gray fallback
};

const getPlanetRadius = (sizeKm: number) => {
  // Convert planet size to a reasonable display radius
  const minRadius = 4;
  const maxRadius = 12;
  const scaleFactor = 0.0001;
  return Math.min(maxRadius, Math.max(minRadius, sizeKm * scaleFactor));
};

interface DrawPlanetOptions {
  x: number;
  y: number;
  planet: Planet;
  isHighlighted: boolean;
  isSelected: boolean;
  isAllowed: boolean;
  zoom: number;
  viewport: { x: number; y: number; zoom: number };
}

const GRID_SIZE = 2000000; // -1M to +1M
const GRID_OFFSET = GRID_SIZE / 2;

export function worldToScreenCoords(
  worldX: number,
  worldY: number,
  viewport: { x: number; y: number; zoom: number },
  canvasWidth: number,
  canvasHeight: number
) {
  // Convert from world coordinates (-1M to +1M) to screen coordinates
  const normalizedX = (worldX + GRID_OFFSET) / GRID_SIZE;
  const normalizedY = (worldY + GRID_OFFSET) / GRID_SIZE;

  const screenX = normalizedX * canvasWidth * viewport.zoom - viewport.x;
  const screenY = normalizedY * canvasHeight * viewport.zoom - viewport.y;

  return { x: screenX, y: screenY };
}

export function drawPlanet(
  ctx: CanvasRenderingContext2D,
  options: DrawPlanetOptions
) {
  const { planet, isHighlighted, isSelected, isAllowed, zoom, viewport } =
    options;

  // Convert coordinates
  const { x, y } = worldToScreenCoords(
    planet.coordinate_x,
    planet.coordinate_y,
    viewport,
    ctx.canvas.width,
    ctx.canvas.height
  );

  // Only draw if planet is in visible area
  const padding = 100 * zoom; // Add some padding for partially visible planets
  if (
    x >= -padding &&
    x <= ctx.canvas.width + padding &&
    y >= -padding &&
    y <= ctx.canvas.height + padding
  ) {
    const baseGlowRadius =
      getPlanetRadius(planet.size_km) * (isSelected ? 8 : 6);
    const glowRadius = baseGlowRadius * zoom;

    // Outer glow ring
    ctx.strokeStyle = getBiomeColor(planet.biome, isAllowed ? 0.4 : 0.1);
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.arc(x, y, glowRadius * 1.2, 0, Math.PI * 2);
    ctx.stroke();

    // Inner glow
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
    const alpha = isAllowed ? (isHighlighted ? 0.9 : 0.8) : 0.3;
    gradient.addColorStop(0, getBiomeColor(planet.biome, alpha));
    gradient.addColorStop(0.6, getBiomeColor(planet.biome, alpha * 0.4));
    gradient.addColorStop(1, "transparent");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
    ctx.fill();

    // Planet core
    ctx.fillStyle = getBiomeColor(planet.biome, isAllowed ? 1 : 0.5);
    ctx.beginPath();
    ctx.arc(x, y, 6 * zoom, 0, Math.PI * 2);
    ctx.fill();

    // Planet name
    const baseFontSize = 14;
    const scaledFontSize = Math.min(Math.max(baseFontSize * zoom, 10), 36);

    ctx.fillStyle = isAllowed ? "#fff" : "#666";
    ctx.font = `bold ${scaledFontSize}px "Space Mono", monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.shadowColor = getBiomeColor(planet.biome, 1);
    ctx.shadowBlur = isHighlighted ? 15 : 10;
    ctx.fillText(planet.name, x, y + glowRadius * 1.5);
  }
}
