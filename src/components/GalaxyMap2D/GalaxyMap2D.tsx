import { useCallback, useEffect, useState, useRef, useMemo } from "react";
import { useGame } from "../../contexts/GameContext";
import { Planet as PlanetType } from "../../models/planet";
import { ZoomControls } from "./ZoomControls";
import { PlanetInfoCard } from "./PlanetInfoCard";

interface GalaxyMap2DProps {
  mode: "homeworld" | "mission-target" | "view-only";
  onPlanetSelect?: (planet: PlanetType) => void;
  highlightedPlanets?: string[];
  allowedPlanets?: string[];
  initialZoom?: number;
  initialCenter?: { x: number; y: number };
}

const MAX_ZOOM = 5;
const ZOOM_STEP = 1.2;
const GRID_SIZE = 10000; // Total grid size (-5000 to 5000)
const CELL_SIZE = 50; // Size of each cell in the grid

const getBiomeColor = (biome: PlanetType["biome"], alpha: number) => {
  const colors: Record<string, string> = {
    ocean: `rgba(56, 189, 248, ${alpha})`,
    jungle: `rgba(234, 179, 8, ${alpha})`,
    desert: `rgba(249, 115, 22, ${alpha})`,
    ice: `rgba(34, 211, 238, ${alpha})`,
    volcanic: `rgba(239, 68, 68, ${alpha})`,
  };
  return colors[biome] || `rgba(32, 224, 160, ${alpha})`;
};

const getPlanetRadius = (size_km: number) => {
  const normalizedSize = (size_km - 1000) / (50000 - 1000);
  const minRadius = 3;
  const maxRadius = 8;
  return minRadius + normalizedSize * (maxRadius - minRadius);
};

export function GalaxyMap2D({
  mode,
  onPlanetSelect,
  highlightedPlanets = [],
  allowedPlanets,
  initialZoom = 1,
  initialCenter = { x: 0, y: 0 },
}: GalaxyMap2DProps) {
  const { state } = useGame();
  const [viewport, setViewport] = useState({
    x: initialCenter.x,
    y: initialCenter.y,
    zoom: initialZoom,
  });
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetType | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, viewportX: 0, viewportY: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();

      if (e.ctrlKey) {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Calculate new zoom
        const zoomFactor = e.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP;
        const newZoom = viewport.zoom * zoomFactor;

        // Calculate minimum zoom based on grid size and canvas size
        const minZoomX = canvas.width / GRID_SIZE;
        const minZoomY = canvas.height / GRID_SIZE;
        const calculatedMinZoom = Math.max(minZoomX, minZoomY) * 0.8; // 80% of the minimum zoom to show grid edges

        // Clamp zoom value
        const clampedZoom = Math.min(
          Math.max(newZoom, calculatedMinZoom),
          MAX_ZOOM
        );

        setViewport((prev) => ({
          ...prev,
          zoom: clampedZoom,
        }));
      } else {
        setViewport((prev) => ({
          ...prev,
          x: prev.x - e.deltaX / prev.zoom,
          y: prev.y - e.deltaY / prev.zoom,
        }));
      }
    },
    [viewport.zoom]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      setIsDragging(true);
      dragStart.current = {
        x: e.clientX,
        y: e.clientY,
        viewportX: viewport.x,
        viewportY: viewport.y,
      };
    },
    [viewport]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;

      setViewport((prev) => ({
        ...prev,
        x: dragStart.current.viewportX - dx / prev.zoom,
        y: dragStart.current.viewportY - dy / prev.zoom,
      }));
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const worldToScreen = useCallback(
    (worldX: number, worldY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };

      const screenX =
        (worldX + GRID_SIZE / 2) * viewport.zoom +
        canvas.width / 2 -
        viewport.x;
      const screenY =
        (worldY + GRID_SIZE / 2) * viewport.zoom +
        canvas.height / 2 -
        viewport.y;
      return { x: screenX, y: screenY };
    },
    [viewport]
  );

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    // Set canvas size to match container
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    // Clear canvas
    ctx.fillStyle = "#000814";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate grid parameters
    const gridStep = CELL_SIZE * viewport.zoom;

    // Calculate the visible range of the grid
    const visibleStartX =
      Math.floor((viewport.x - canvas.width / 2) / gridStep) * gridStep;
    const visibleStartY =
      Math.floor((viewport.y - canvas.height / 2) / gridStep) * gridStep;
    const visibleEndX =
      Math.ceil((viewport.x + canvas.width / 2) / gridStep) * gridStep;
    const visibleEndY =
      Math.ceil((viewport.y + canvas.height / 2) / gridStep) * gridStep;

    // Draw grid
    ctx.strokeStyle = "rgba(32, 224, 160, 0.15)";
    ctx.lineWidth = 1;

    // Vertical lines
    for (let x = visibleStartX; x <= visibleEndX; x += gridStep) {
      const screenX = x - viewport.x + canvas.width / 2;
      ctx.beginPath();
      ctx.moveTo(screenX, 0);
      ctx.lineTo(screenX, canvas.height);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = visibleStartY; y <= visibleEndY; y += gridStep) {
      const screenY = y - viewport.y + canvas.height / 2;
      ctx.beginPath();
      ctx.moveTo(0, screenY);
      ctx.lineTo(canvas.width, screenY);
      ctx.stroke();
    }

    // Draw axes
    const origin = worldToScreen(0, 0);

    // X-axis
    ctx.strokeStyle = "rgba(255, 0, 0, 0.3)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, origin.y);
    ctx.lineTo(canvas.width, origin.y);
    ctx.stroke();

    // Y-axis
    ctx.strokeStyle = "rgba(0, 0, 255, 0.3)";
    ctx.beginPath();
    ctx.moveTo(origin.x, 0);
    ctx.lineTo(origin.x, canvas.height);
    ctx.stroke();

    // Draw planets
    state.planets?.forEach((planet) => {
      const pos = worldToScreen(planet.coordinate_x, planet.coordinate_y);
      const radius = getPlanetRadius(planet.size_km) * viewport.zoom;

      // Draw glow
      const gradient = ctx.createRadialGradient(
        pos.x,
        pos.y,
        radius,
        pos.x,
        pos.y,
        radius * 3
      );
      const color = getBiomeColor(planet.biome, 1);
      gradient.addColorStop(0, color.replace("1)", "0.3)"));
      gradient.addColorStop(1, color.replace("1)", "0)"));

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radius * 3, 0, Math.PI * 2);
      ctx.fill();

      // Draw planet
      const isHighlighted = highlightedPlanets.includes(planet.id);
      const isAllowed = !allowedPlanets || allowedPlanets.includes(planet.id);

      ctx.fillStyle = getBiomeColor(planet.biome, isAllowed ? 1 : 0.4);
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
      ctx.fill();

      if (isHighlighted) {
        ctx.strokeStyle = "rgba(32, 224, 160, 0.8)";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Draw planet name
      ctx.font = `${12 * viewport.zoom}px monospace`;
      ctx.fillStyle = isHighlighted ? "#20e0a0" : "#ffffff";
      ctx.textAlign = "center";
      ctx.fillText(planet.name, pos.x, pos.y - radius * 2.5);
    });

    animationFrameRef.current = requestAnimationFrame(draw);
  }, [
    state.planets,
    viewport,
    highlightedPlanets,
    allowedPlanets,
    worldToScreen,
  ]);

  useEffect(() => {
    draw();
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [draw]);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("wheel", handleWheel);
    };
  }, [handleMouseMove, handleMouseUp, handleWheel]);

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (isDragging) {
        console.log("Ignoring click - dragging");
        return;
      }

      const canvas = canvasRef.current;
      const rect = canvas?.getBoundingClientRect();
      if (!rect || !canvas) return;

      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      console.log("Click at:", { mouseX, mouseY });

      const clickedPlanet = state.planets?.find((planet) => {
        const pos = worldToScreen(planet.coordinate_x, planet.coordinate_y);
        const dx = mouseX - pos.x;
        const dy = mouseY - pos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const clickRadius = 20 * viewport.zoom;

        console.log("Checking planet:", planet.name, {
          planetPos: pos,
          distance,
          clickRadius,
          isInRange: distance < clickRadius,
        });

        return distance < clickRadius;
      });

      if (clickedPlanet) {
        console.log("Planet clicked:", clickedPlanet.name);

        if (!allowedPlanets || allowedPlanets.includes(clickedPlanet.id)) {
          console.log("Setting selected planet");
          setSelectedPlanet(clickedPlanet);
          setShowInfo(true);
        } else {
          console.log("Planet not allowed");
        }
      } else {
        console.log("No planet clicked");
      }
    },
    [state.planets, viewport, allowedPlanets, isDragging, worldToScreen]
  );

  // Calculate info card position based on selected planet
  const infoCardPosition = useMemo(() => {
    if (!selectedPlanet) return { x: 0, y: 0 };
    return worldToScreen(
      selectedPlanet.coordinate_x,
      selectedPlanet.coordinate_y
    );
  }, [selectedPlanet, worldToScreen]);

  const handleZoom = useCallback((zoomIn: boolean) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setViewport((prev) => {
      const newZoom = prev.zoom * (zoomIn ? ZOOM_STEP : 1 / ZOOM_STEP);

      // Calculate minimum zoom based on grid size and canvas size
      const minZoomX = canvas.width / GRID_SIZE;
      const minZoomY = canvas.height / GRID_SIZE;
      const calculatedMinZoom = Math.max(minZoomX, minZoomY) * 0.8;

      return {
        ...prev,
        zoom: Math.min(Math.max(newZoom, calculatedMinZoom), MAX_ZOOM),
      };
    });
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-[800px] h-[600px] overflow-hidden border border-primary/20 rounded-lg"
      style={{ cursor: isDragging ? "grabbing" : "grab" }}
    >
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        onMouseDown={handleMouseDown}
        className="w-full h-full"
      />

      {showInfo && selectedPlanet && (
        <PlanetInfoCard
          planet={selectedPlanet}
          mode={mode}
          onClose={() => setShowInfo(false)}
          onSelect={() => {
            onPlanetSelect?.(selectedPlanet);
            setShowInfo(false);
          }}
          viewport={viewport}
          position={infoCardPosition}
        />
      )}

      <ZoomControls
        onZoomIn={() => handleZoom(true)}
        onZoomOut={() => handleZoom(false)}
      />
    </div>
  );
}
