import { Container, Graphics } from "@pixi/react";
import { Graphics as PixiGraphics } from "pixi.js";
import { useCallback, useMemo } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  alpha: number;
}

interface StarFieldProps {
  width: number;
  height: number;
  viewport: {
    x: number;
    y: number;
    zoom: number;
  };
  scale: number;
}

export function StarField({ width, height, viewport, scale }: StarFieldProps) {
  // Generate random stars
  const stars = useMemo(() => {
    const starCount = Math.floor((width * height) / 1000); // Adjust density here
    const stars: Star[] = [];

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width * 2 - width,
        y: Math.random() * height * 2 - height,
        size: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.5 + 0.3,
      });
    }

    return stars;
  }, [width, height]);

  // Draw stars
  const drawStars = useCallback(
    (g: PixiGraphics) => {
      g.clear();

      stars.forEach((star) => {
        // Calculate star position relative to viewport
        const screenX = (star.x - viewport.x) * 0.1; // Parallax effect
        const screenY = (star.y - viewport.y) * 0.1;

        // Only draw stars that are visible
        if (
          screenX >= -width &&
          screenX <= width * 2 &&
          screenY >= -height &&
          screenY <= height * 2
        ) {
          g.beginFill(0xffffff, star.alpha);
          g.drawCircle(screenX, screenY, star.size);
          g.endFill();
        }
      });
    },
    [stars, viewport, width, height]
  );

  return (
    <Container>
      <Graphics draw={drawStars} />
    </Container>
  );
}
