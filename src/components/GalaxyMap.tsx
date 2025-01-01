import { useState, useEffect, useRef } from "react";
import { Planet } from "../models/planet";
import { useGame } from "../contexts/GameContext";
import { Button } from "./ui/button";
import { Plus, Minus } from "lucide-react";
import { worldToScreenCoords } from "./GalaxyMap/drawPlanet";

// Constants from the game design document
const GRID_SIZE = 10000; // Total grid size (-500 to +500 = 1000 total)
const GRID_OFFSET = GRID_SIZE / 2; // 5000, used to convert between coordinate systems
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 5;
const ZOOM_SPEED = 0.001;

// Planet size to radius mapping
const getPlanetRadius = (size: number) => {
  return 10 + size * 2; // Base radius of 10, scaled by size
};

// Biome color mapping
const getBiomeColor = (biome: string, alpha: number = 1) => {
  const colors: Record<string, string> = {
    desert: `rgba(194, 178, 128, ${alpha})`,
    ocean: `rgba(65, 105, 225, ${alpha})`,
    forest: `rgba(34, 139, 34, ${alpha})`,
    ice: `rgba(176, 224, 230, ${alpha})`,
    volcanic: `rgba(139, 0, 0, ${alpha})`,
    gas: `rgba(147, 112, 219, ${alpha})`,
    terran: `rgba(100, 149, 237, ${alpha})`,
  };
  return colors[biome] || `rgba(128, 128, 128, ${alpha})`; // Gray fallback
};

interface GalaxyMapProps {
  mode: "homeworld" | "mission-target" | "view-only";
  onPlanetSelect?: (planet: Planet) => void;
  highlightedPlanets?: string[]; // Array of planet IDs to highlight
  allowedPlanets?: string[]; // Array of planet IDs that can be selected
  initialZoom?: number;
  initialCenter?: { x: number; y: number };
}

// Helper functions
const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

const getTouchDistance = (touches: TouchList) => {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
};

const drawPlanet = (
  ctx: CanvasRenderingContext2D,
  {
    x,
    y,
    planet,
    isHighlighted,
    isSelected,
    isAllowed,
    zoom,
  }: {
    x: number;
    y: number;
    planet: Planet;
    isHighlighted: boolean;
    isSelected: boolean;
    isAllowed: boolean;
    zoom: number;
  }
) => {
  const radius = getPlanetRadius(planet.size_km) * zoom;
  const glowRadius = radius * 2;

  // Draw glow
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
  const baseColor = getBiomeColor(planet.biome, isAllowed ? 0.6 : 0.2);
  gradient.addColorStop(0, baseColor);
  gradient.addColorStop(1, "transparent");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
  ctx.fill();

  // Draw planet core
  ctx.fillStyle = getBiomeColor(planet.biome, isAllowed ? 1 : 0.4);
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  // Draw highlight/selection rings
  if (isHighlighted || isSelected) {
    ctx.strokeStyle = isSelected ? "#20E0A0" : "#FFFFFF";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, radius * 1.5, 0, Math.PI * 2);
    ctx.stroke();
  }
};

export function GalaxyMap({
  mode,
  onPlanetSelect,
  highlightedPlanets = [],
  allowedPlanets,
  initialZoom = 1,
  initialCenter = { x: 0, y: 0 },
}: GalaxyMapProps) {
  const { state } = useGame();
  const [viewport, setViewport] = useState({
    x: initialCenter.x,
    y: initialCenter.y,
    zoom: initialZoom,
  });
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Touch handling state and functions
  const [touchDistance, setTouchDistance] = useState<number | null>(null);

  // Add debug logging
  useEffect(() => {
    console.log("GalaxyMap state:", {
      mode,
      planetsAvailable: state.planets?.length || 0,
      highlightedCount: highlightedPlanets.length,
      allowedCount: allowedPlanets?.length || 0,
      viewport: {
        zoom: viewport.zoom,
        x: viewport.x,
        y: viewport.y,
      },
    });
  }, [mode, state.planets, highlightedPlanets, allowedPlanets, viewport]);

  // Drawing function
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size to container size
    const updateCanvasSize = () => {
      if (containerRef.current) {
        canvas.width = containerRef.current.clientWidth;
        canvas.height = containerRef.current.clientHeight;
      }
    };
    updateCanvasSize();

    const draw = () => {
      if (!canvasRef.current || !ctx) return;

      // Clear canvas
      ctx.fillStyle = "#000814";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw debug info
      ctx.fillStyle = "#666";
      ctx.font = "12px monospace";
      ctx.fillText(`Planets: ${state.planets?.length || 0}`, 10, 20);
      ctx.fillText(`Allowed: ${allowedPlanets?.length || 0}`, 10, 40);
      ctx.fillText(`Highlighted: ${highlightedPlanets.length}`, 10, 60);

      // Draw grid
      ctx.strokeStyle = "rgba(32, 224, 160, 0.15)";
      ctx.lineWidth = 1;
      const CELL_SIZE = 50 * viewport.zoom;

      // Calculate visible grid range
      const startX = Math.floor(viewport.x / CELL_SIZE);
      const startY = Math.floor(viewport.y / CELL_SIZE);
      const endX = Math.ceil((viewport.x + canvas.width) / CELL_SIZE);
      const endY = Math.ceil((viewport.y + canvas.height) / CELL_SIZE);

      // Draw grid cells
      for (let x = startX; x <= endX; x++) {
        for (let y = startY; y <= endY; y++) {
          const screenX = x * CELL_SIZE - viewport.x;
          const screenY = y * CELL_SIZE - viewport.y;
          ctx.strokeRect(screenX, screenY, CELL_SIZE, CELL_SIZE);
        }
      }

      // Draw planets
      state.planets?.forEach((planet) => {
        // Convert planet coordinates to screen coordinates using the same system as ChooseHomeworld
        const screenX =
          (planet.coordinate_x + GRID_OFFSET) * viewport.zoom - viewport.x;
        const screenY =
          (planet.coordinate_y + GRID_OFFSET) * viewport.zoom - viewport.y;

        // Only draw if planet is in view
        if (
          screenX >= -CELL_SIZE &&
          screenX <= canvas.width + CELL_SIZE &&
          screenY >= -CELL_SIZE &&
          screenY <= canvas.height + CELL_SIZE
        ) {
          const isHighlighted = highlightedPlanets.includes(planet.id);
          const isSelected = selectedPlanet?.id === planet.id;
          const isAllowed =
            !allowedPlanets || allowedPlanets.includes(planet.id);

          // Draw planet glow and core
          drawPlanet(ctx, {
            x: screenX,
            y: screenY,
            planet,
            isHighlighted,
            isSelected,
            isAllowed,
            zoom: viewport.zoom,
          });
        }
      });
    };

    draw();

    // Add resize listener
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, [
    viewport,
    selectedPlanet,
    highlightedPlanets,
    allowedPlanets,
    state.planets,
  ]);

  // Handle interactions
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find clicked planet using the same coordinate system
    const clickedPlanet = state.planets?.find((planet) => {
      const planetScreenX =
        (planet.coordinate_x + GRID_OFFSET) * viewport.zoom - viewport.x;
      const planetScreenY =
        (planet.coordinate_y + GRID_OFFSET) * viewport.zoom - viewport.y;
      const distance = Math.sqrt(
        Math.pow(x - planetScreenX, 2) + Math.pow(y - planetScreenY, 2)
      );
      return distance < 30 * viewport.zoom;
    });

    if (
      clickedPlanet &&
      (!allowedPlanets || allowedPlanets.includes(clickedPlanet.id))
    ) {
      setSelectedPlanet(clickedPlanet);
      onPlanetSelect?.(clickedPlanet);
    }
  };

  // Touch handling
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 2) {
      setTouchDistance(getTouchDistance(e.touches));
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();

    if (e.touches.length === 2) {
      // Handle pinch zoom
      const newDistance = getTouchDistance(e.touches);
      if (touchDistance && newDistance) {
        const scale = newDistance / touchDistance;
        const newZoom = clamp(viewport.zoom * scale, MIN_ZOOM, MAX_ZOOM);

        setViewport((prev) => ({
          ...prev,
          zoom: newZoom,
        }));
        setTouchDistance(newDistance);
      }
    } else if (e.touches.length === 1) {
      // Handle pan
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const touch = e.touches[0];
      const prevTouch = e.touches[0];
      const movementX = touch.clientX - prevTouch.clientX;
      const movementY = touch.clientY - prevTouch.clientY;

      setViewport((prev) => {
        const maxPan = GRID_SIZE * prev.zoom - rect.width;
        return {
          ...prev,
          x: clamp(prev.x - movementX, 0, maxPan),
          y: clamp(prev.y - movementY, 0, maxPan),
        };
      });
    }
  };

  const handleTouchEnd = () => {
    setTouchDistance(null);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();

    if (e.ctrlKey || e.metaKey) {
      // Handle zoom
      const delta = -e.deltaY;
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      // Calculate zoom center point (mouse position)
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      setViewport((prev) => {
        const zoomDelta = 1 + delta * ZOOM_SPEED;
        const newZoom = clamp(prev.zoom * zoomDelta, MIN_ZOOM, MAX_ZOOM);

        // Adjust position to zoom towards mouse cursor
        const zoomFactor = newZoom / prev.zoom;
        const newX = mouseX - (mouseX - prev.x) * zoomFactor;
        const newY = mouseY - (mouseY - prev.y) * zoomFactor;

        return {
          x: clamp(newX, 0, GRID_SIZE * newZoom - rect.width),
          y: clamp(newY, 0, GRID_SIZE * newZoom - rect.height),
          zoom: newZoom,
        };
      });
    } else {
      // Handle pan
      setViewport((prev) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return prev;

        const maxPan = GRID_SIZE * prev.zoom - rect.width;
        return {
          ...prev,
          x: clamp(prev.x - e.deltaX, 0, maxPan),
          y: clamp(prev.y - e.deltaY, 0, maxPan),
        };
      });
    }
  };

  // Zoom button handlers
  const handleZoomButton = (zoomIn: boolean) => {
    setViewport((prev) => {
      const zoomDelta = zoomIn ? 1.2 : 0.8;
      const newZoom = clamp(prev.zoom * zoomDelta, MIN_ZOOM, MAX_ZOOM);

      // Zoom towards center of viewport
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return prev;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const zoomFactor = newZoom / prev.zoom;
      const newX = centerX - (centerX - prev.x) * zoomFactor;
      const newY = centerY - (centerY - prev.y) * zoomFactor;

      return {
        x: clamp(newX, 0, GRID_SIZE * newZoom - rect.width),
        y: clamp(newY, 0, GRID_SIZE * newZoom - rect.height),
        zoom: newZoom,
      };
    });
  };

  useEffect(() => {
    if (!state.planets) return;

    console.log("Galaxy Map Debug:", {
      totalPlanets: state.planets.length,
      visiblePlanets: state.planets.filter((p) => {
        const { x, y } = worldToScreenCoords(
          p.coordinate_x,
          p.coordinate_y,
          viewport,
          canvasRef.current?.width || 0,
          canvasRef.current?.height || 0
        );
        return (
          x >= -100 &&
          x <= (canvasRef.current?.width || 0) + 100 &&
          y >= -100 &&
          y <= (canvasRef.current?.height || 0) + 100
        );
      }).length,
      viewportState: viewport,
      canvasSize: {
        width: canvasRef.current?.width,
        height: canvasRef.current?.height,
      },
    });
  }, [state.planets, viewport]);

  return (
    <div
      ref={containerRef}
      className="relative h-[600px] rounded-lg neon-border overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
        className="cursor-crosshair"
      />

      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleZoomButton(true)}
          className="w-8 h-8 bg-black/30 border-primary/30 hover:bg-primary/20 hover:border-primary/60 neon-border"
        >
          <Plus className="h-4 w-4" />
          <span className="sr-only">Zoom In</span>
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleZoomButton(false)}
          className="w-8 h-8 bg-black/30 border-primary/30 hover:bg-primary/20 hover:border-primary/60 neon-border"
        >
          <Minus className="h-4 w-4" />
          <span className="sr-only">Zoom Out</span>
        </Button>
      </div>
    </div>
  );
}
