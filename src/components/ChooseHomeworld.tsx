import { useState, useEffect, useRef } from "react";
import { Planet } from "../models/planet";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Plus, Minus } from "lucide-react";
import { supabase } from "../lib/supabase";
import { api } from "../lib/api";

// Update constants
const GRID_SIZE = 10000; // Total grid size (-500 to +500 = 1000 total)
const GRID_OFFSET = GRID_SIZE / 2; // 500, used to convert between coordinate systems

// Add new helper functions
const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

// Add this function near the top of the component, after the imports
const getPlanetRadius = (size: number) => {
  // Normalize planet size between 0 and 1
  // MIN_PLANET_SIZE = 1000, MAX_PLANET_SIZE = 50000
  const normalizedSize = (size - 1000) / (50000 - 1000);

  // Map to radius range (3-8 pixels)
  const minRadius = 3;
  const maxRadius = 8;
  return minRadius + normalizedSize * (maxRadius - minRadius);
};

export function ChooseHomeworld() {
  const [availablePlanets, setAvailablePlanets] = useState<Planet[]>([]);
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 1 });
  const [clickedCoordinates, setClickedCoordinates] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const chooseHomeworld = async (planetId: string) => {
    try {
      await api.planets.claim(planetId, true);
    } catch (error) {
      console.error("Error choosing homeworld:", error);
    }
  };

  // Track touch gestures
  const [touchDistance, setTouchDistance] = useState<number | null>(null);

  // Calculate distance between two touch points
  const getTouchDistance = (touches: TouchList) => {
    if (touches.length < 2) return null;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();

    if (e.ctrlKey) {
      // ... existing zoom logic ...
    } else {
      setViewport((prev) => {
        const maxPan = GRID_SIZE * prev.zoom - canvasRef.current!.width;
        return {
          ...prev,
          x: clamp(prev.x - e.deltaX, 0, maxPan),
          y: clamp(prev.y - e.deltaY, 0, maxPan),
        };
      });
    }
  };

  const handleTouchStart = (e: TouchEvent) => {
    const distance = getTouchDistance(e.touches);
    if (distance) setTouchDistance(distance);
  };

  const handleTouchMove = (e: TouchEvent) => {
    e.preventDefault();

    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const prevTouch = e.touches[0];

      setViewport((prev) => {
        const maxPan = GRID_SIZE * prev.zoom - canvasRef.current!.width;
        return {
          ...prev,
          x: clamp(prev.x - (touch.clientX - prevTouch.clientX), 0, maxPan),
          y: clamp(prev.y - (touch.clientY - prevTouch.clientY), 0, maxPan),
        };
      });
    }
    // ... rest of touch handling ...
  };

  const handleTouchEnd = () => {
    setTouchDistance(null);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener("wheel", handleWheel, { passive: false });
    canvas.addEventListener("touchstart", handleTouchStart);
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd);

    return () => {
      canvas.removeEventListener("wheel", handleWheel);
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
    };
  }, [viewport, touchDistance]);

  useEffect(() => {
    const fetchPlanets = async () => {
      const { data, error } = await supabase
        .from("planets")
        .select("*")
        .is("owner_id", null);

      if (error) {
        console.error("Error fetching planets:", error);
        return;
      }

      setAvailablePlanets(data || []);
      setLoading(false);
    };

    fetchPlanets();
  }, []);

  useEffect(() => {
    if (!canvasRef.current || loading) return;

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
    window.addEventListener("resize", updateCanvasSize);

    // Draw function
    const draw = () => {
      ctx.fillStyle = "#000814";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid aligned to cells
      ctx.strokeStyle = "rgba(32, 224, 160, 0.15)";
      ctx.lineWidth = 1;
      const CELL_SIZE = 50; // Base cell size in pixels
      const scaledCellSize = CELL_SIZE * viewport.zoom;

      // Calculate visible grid range
      const startX = Math.floor(viewport.x / scaledCellSize);
      const startY = Math.floor(viewport.y / scaledCellSize);
      const endX = Math.ceil((viewport.x + canvas.width) / scaledCellSize);
      const endY = Math.ceil((viewport.y + canvas.height) / scaledCellSize);

      // Draw only visible grid cells
      for (let x = startX; x <= endX; x++) {
        for (let y = startY; y <= endY; y++) {
          const screenX = x * scaledCellSize - viewport.x;
          const screenY = y * scaledCellSize - viewport.y;

          ctx.strokeRect(screenX, screenY, scaledCellSize, scaledCellSize);
        }
      }

      // Draw planets aligned to grid cells
      availablePlanets.forEach((planet) => {
        const screenX =
          (planet.coordinate_x + GRID_OFFSET) * viewport.zoom - viewport.x;
        const screenY =
          (planet.coordinate_y + GRID_OFFSET) * viewport.zoom - viewport.y;

        // Only draw if planet is visible
        if (
          screenX >= -scaledCellSize &&
          screenX <= canvas.width + scaledCellSize &&
          screenY >= -scaledCellSize &&
          screenY <= canvas.height + scaledCellSize
        ) {
          // Enhanced planet glow effect
          const isSelected = selectedPlanet?.id === planet.id;
          const baseGlowRadius =
            getPlanetRadius(planet.size_km) * (isSelected ? 8 : 6);
          const glowRadius = baseGlowRadius * viewport.zoom;

          // Outer glow ring
          ctx.strokeStyle = getBiomeColor(planet.biome, 0.4);
          ctx.lineWidth = 2 * viewport.zoom;
          ctx.beginPath();
          ctx.arc(screenX, screenY, glowRadius * 1.2, 0, Math.PI * 2);
          ctx.stroke();

          // Inner glow
          const gradient = ctx.createRadialGradient(
            screenX,
            screenY,
            0,
            screenX,
            screenY,
            glowRadius
          );
          gradient.addColorStop(0, getBiomeColor(planet.biome, 0.8));
          gradient.addColorStop(0.6, getBiomeColor(planet.biome, 0.3));
          gradient.addColorStop(1, "transparent");
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(screenX, screenY, glowRadius, 0, Math.PI * 2);
          ctx.fill();

          // Planet core with scanline effect
          ctx.fillStyle = getBiomeColor(planet.biome, 1);
          ctx.beginPath();
          ctx.arc(screenX, screenY, 6 * viewport.zoom, 0, Math.PI * 2);
          ctx.fill();

          // Planet name with enhanced styling
          const baseFontSize = 14;
          const scaledFontSize = Math.min(
            Math.max(baseFontSize * viewport.zoom, 10),
            36
          );

          ctx.fillStyle = "#fff";
          ctx.font = `bold ${scaledFontSize}px "Space Mono", monospace`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          // Enhanced text glow
          ctx.shadowColor = getBiomeColor(planet.biome, 1);
          ctx.shadowBlur = 10;
          ctx.fillText(planet.name, screenX, screenY + glowRadius * 1.5);
        }
      });
    };

    draw();

    return () => window.removeEventListener("resize", updateCanvasSize);
  }, [availablePlanets, selectedPlanet, viewport, loading]);

  const getBiomeColor = (biome: Planet["biome"], alpha: number) => {
    const colors: Record<string, string> = {
      ocean: `rgba(56, 189, 248, ${alpha})`,
      jungle: `rgba(234, 179, 8, ${alpha})`,
      desert: `rgba(249, 115, 22, ${alpha})`,
      ice: `rgba(34, 211, 238, ${alpha})`,
      volcanic: `rgba(239, 68, 68, ${alpha})`,
    };
    return colors[biome] || `rgba(32, 224, 160, ${alpha})`;
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate grid coordinates (converting back to -500 to +500 range)
    const gridX = Math.floor((x + viewport.x) / viewport.zoom - GRID_OFFSET);
    const gridY = Math.floor((y + viewport.y) / viewport.zoom - GRID_OFFSET);

    setClickedCoordinates({ x: gridX, y: gridY });

    // Update planet detection
    const clickedPlanet = availablePlanets.find((planet) => {
      const planetScreenX =
        (planet.coordinate_x + GRID_OFFSET) * viewport.zoom - viewport.x;
      const planetScreenY =
        (planet.coordinate_y + GRID_OFFSET) * viewport.zoom - viewport.y;
      const distance = Math.sqrt(
        Math.pow(x - planetScreenX, 2) + Math.pow(y - planetScreenY, 2)
      );
      return distance < 30;
    });

    if (clickedPlanet) {
      setSelectedPlanet(clickedPlanet);
    }
  };

  const handleZoomButton = (zoomIn: boolean) => {
    const zoomFactor = 1.2;
    const newZoom = Math.min(
      Math.max(viewport.zoom * (zoomIn ? zoomFactor : 1 / zoomFactor), 0.1),
      10
    );

    // Zoom towards center of canvas
    const canvas = canvasRef.current;
    if (!canvas) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    setViewport((prev) => ({
      x: prev.x + (centerX - canvas.width / 2) * (1 - newZoom / prev.zoom),
      y: prev.y + (centerY - canvas.height / 2) * (1 - newZoom / prev.zoom),
      zoom: newZoom,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold neon-text mb-2">
          SELECT YOUR HOMEWORLD
        </h2>
        <p className="text-muted-foreground">
          Choose your starting planet carefully, Commander. This decision will
          shape your destiny.
        </p>
        {clickedCoordinates && (
          <p className="text-sm text-muted-foreground mt-2">
            Selected Grid Coordinates: [{clickedCoordinates.x},{" "}
            {clickedCoordinates.y}]
          </p>
        )}
      </div>

      {loading ? (
        <div className="text-center neon-text">
          SCANNING AVAILABLE PLANETS...
        </div>
      ) : (
        <div
          ref={containerRef}
          className="relative h-[600px] rounded-lg neon-border overflow-hidden"
        >
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
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

          {selectedPlanet && (
            <div className="absolute bottom-4 left-4 right-4">
              <Card className="bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="neon-text text-lg">
                    {selectedPlanet.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Coordinates: </span>
                    <span className="font-mono">
                      [{selectedPlanet.coordinate_x.toLocaleString()},
                      {selectedPlanet.coordinate_y.toLocaleString()}]
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Size: </span>
                    <span className="font-mono">
                      {selectedPlanet.size_km.toLocaleString()} km
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Biome: </span>
                    <span
                      className="font-mono"
                      style={{ color: getBiomeColor(selectedPlanet.biome, 1) }}
                    >
                      {selectedPlanet.biome.replace("_", " ")}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-center mt-6">
        <Button
          disabled={!selectedPlanet}
          onClick={() => selectedPlanet && chooseHomeworld(selectedPlanet.id)}
          className="px-8 py-6 text-xl bg-primary hover:bg-primary/80 text-primary-foreground neon-border"
        >
          ESTABLISH COLONY
        </Button>
      </div>
    </div>
  );
}
