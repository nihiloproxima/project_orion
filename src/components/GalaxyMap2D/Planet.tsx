import { Container, Graphics, Text } from "@pixi/react";
import * as PIXI from "pixi.js";
import { useCallback } from "react";
import { Planet as PlanetType } from "../../models/planet";

interface PlanetProps {
  planet: PlanetType;
  isHighlighted: boolean;
  isAllowed: boolean;
  onClick: () => void;
  viewport: {
    zoom: number;
  };
}

const getPlanetRadius = (size_km: number) => {
  // Scale planet size for visualization
  return Math.max(Math.log(size_km) * 2, 4);
};

const getBiomeColor = (biome: PlanetType["biome"]) => {
  switch (biome) {
    case "ocean":
      return 0x38bdf8;
    case "jungle":
      return 0xeab308;
    case "desert":
      return 0xf97316;
    case "ice":
      return 0x22d3ee;
    case "volcanic":
      return 0xef4444;
    default:
      return 0x20e0a0;
  }
};

export function Planet({
  planet,
  isHighlighted,
  isAllowed,
  onClick,
  viewport,
}: PlanetProps) {
  const radius = getPlanetRadius(planet.size_km);
  const color = getBiomeColor(planet.biome);

  // Draw planet glow
  const drawGlow = useCallback(
    (g: PIXI.Graphics) => {
      g.clear();

      // Make the hitArea slightly larger than the glow
      g.hitArea = new PIXI.Circle(0, 0, radius * 3);

      // Outer glow ring
      g.lineStyle(2, color, 0.4);
      g.drawCircle(0, 0, radius * (isHighlighted ? 3 : 2));

      // Inner glow gradient
      const gradientSteps = 8;
      for (let i = gradientSteps; i > 0; i--) {
        const ratio = i / gradientSteps;
        g.beginFill(color, 0.1 * ratio);
        g.drawCircle(0, 0, radius * (1 + ratio));
        g.endFill();
      }
    },
    [color, radius, isHighlighted]
  );

  // Draw planet body
  const drawPlanet = useCallback(
    (g: PIXI.Graphics) => {
      g.clear();
      g.beginFill(color, isAllowed ? 1 : 0.4);
      g.drawCircle(0, 0, radius);
      g.endFill();
    },
    [color, radius, isAllowed]
  );

  const handleClick = useCallback(
    (e: any) => {
      e.stopPropagation();
      onClick();
    },
    [onClick]
  );

  return (
    <Container
      position={[planet.coordinate_x, planet.coordinate_y]}
      eventMode="static"
      cursor={isAllowed ? "pointer" : "not-allowed"}
      pointerdown={handleClick}
    >
      <Graphics draw={drawGlow} />
      <Graphics draw={drawPlanet} />
      <Text
        text={planet.name}
        anchor={0.5}
        y={-radius * 2.5}
        style={{
          fontSize: 12 / viewport.zoom,
          fill: isHighlighted ? 0x20e0a0 : 0xffffff,
          align: "center",
          opacity: isAllowed ? 1 : 0.4,
        }}
      />
    </Container>
  );
}
