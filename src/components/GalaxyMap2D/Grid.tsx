import { Graphics } from "@pixi/react";
import { Graphics as PixiGraphics } from "pixi.js";

interface GridProps {
  viewport: {
    x: number;
    y: number;
    zoom: number;
  };
}

const GRID_SIZE = 10000;
const CELL_SIZE = 200;

export function Grid({ viewport }: GridProps) {
  const draw = (g: PixiGraphics) => {
    g.clear();

    // Set grid style
    g.lineStyle(1, 0x20e0a0, 0.15);

    const divisions = GRID_SIZE / CELL_SIZE;
    const halfGrid = GRID_SIZE / 2;

    // Draw vertical lines
    for (let i = -divisions / 2; i <= divisions / 2; i++) {
      const x = i * CELL_SIZE;
      g.moveTo(x, -halfGrid);
      g.lineTo(x, halfGrid);
    }

    // Draw horizontal lines
    for (let i = -divisions / 2; i <= divisions / 2; i++) {
      const y = i * CELL_SIZE;
      g.moveTo(-halfGrid, y);
      g.lineTo(halfGrid, y);
    }

    // Draw main axes with different colors
    g.lineStyle(2, 0xff0000, 0.3); // X-axis (red)
    g.moveTo(-halfGrid, 0);
    g.lineTo(halfGrid, 0);

    g.lineStyle(2, 0x0000ff, 0.3); // Y-axis (blue)
    g.moveTo(0, -halfGrid);
    g.lineTo(0, halfGrid);
  };

  return <Graphics draw={draw} />;
}
