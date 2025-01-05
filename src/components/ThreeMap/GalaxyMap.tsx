import React, { useEffect, useRef, useState } from "react";
import { Canvas, ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { useGame } from "@/contexts/GameContext";
import { Planet } from "@/models";
import { supabase } from "@/lib/supabase";
import { FleetMovement } from "@/models";
import { formatTimeString } from "@/lib/utils";

function PlanetObject({
  planet,
  isHighlighted,
  isSelectable,
  onSelect,
  mode,
}: {
  planet: Planet;
  isHighlighted: boolean;
  isSelectable: boolean;
  onSelect?: () => void;
  mode: "view-only" | "mission-target" | "homeworld";
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isInfoCardHovered, setIsInfoCardHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();
  const { state } = useGame();

  const radius = Math.max(Math.log(planet.size_km) * 2, 4);
  const hitboxRadius = radius * 2; // Larger hitbox for easier clicking

  const getTextStyle = () => {
    const baseSize = 12;
    const scale = Math.min(Math.max(camera.zoom * baseSize, 8), baseSize);

    return {
      fontSize: `${scale}px`,
      opacity: camera.zoom < 0.15 ? 0 : 1,
      transition: "opacity 0.2s ease",
    };
  };

  const getBiomeColor = () => {
    switch (planet.biome) {
      case "ocean":
        return new THREE.Color(0x38bdf8);
      case "jungle":
        return new THREE.Color(0xeab308);
      case "desert":
        return new THREE.Color(0xf97316);
      case "ice":
        return new THREE.Color(0x22d3ee);
      case "volcanic":
        return new THREE.Color(0xef4444);
      default:
        return new THREE.Color(0x20e0a0);
    }
  };

  const isOwnedByPlayer = planet.owner_id === state.currentUser?.id;

  useFrame((state) => {
    if (meshRef.current && (isHighlighted || isHovered)) {
      const scale = 1.2 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      meshRef.current.scale.set(scale, scale, 1);
    } else if (meshRef.current) {
      meshRef.current.scale.set(1, 1, 1);
    }

    // Only animate glow for owned planets
    if (glowRef.current && isOwnedByPlayer) {
      const glowOpacity = 0.2 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
      const glowScale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      glowRef.current.material.opacity = glowOpacity;
      glowRef.current.scale.set(glowScale, glowScale, 1);
    }
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (mode === "homeworld" && isSelectable && onSelect) {
      onSelect();
    }
  };

  const isActive = isHovered || isInfoCardHovered;

  return (
    <group
      position={[planet.coordinate_x, planet.coordinate_y, 0]}
      onClick={handleClick}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
    >
      {/* Hitbox (invisible but clickable) */}
      <mesh>
        <circleGeometry args={[hitboxRadius, 32]} />
        <meshBasicMaterial
          visible={false}
          transparent
          opacity={isSelectable ? 1 : 0}
        />
      </mesh>

      {/* Main planet circle */}
      <mesh ref={meshRef}>
        <circleGeometry args={[radius, 32]} />
        <meshBasicMaterial
          color={getBiomeColor()}
          transparent
          opacity={!isSelectable ? 0.4 : isHighlighted || isHovered ? 1 : 0.8}
        />
      </mesh>

      {/* Glow effect */}
      {(isOwnedByPlayer || isHovered) && (
        <mesh ref={glowRef}>
          <circleGeometry args={[radius * 4, 32]} />
          <meshBasicMaterial
            color={getBiomeColor()}
            transparent
            opacity={0.3}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      )}
      {/* Planet label */}
      <Html position={[0, radius * 2, 0]}>
        <div
          className={`text-white pointer-events-none text-center ${
            !isSelectable ? "opacity-40" : ""
          }`}
          style={getTextStyle()}
        >
          {planet.name}
          {mode === "homeworld" && isSelectable && (
            <div className="text-emerald-400 text-xs">Select as Homeworld</div>
          )}
        </div>
      </Html>

      {/* Info card */}
      {isActive && (
        <Planet3DInfoCard
          planet={planet}
          position={[0, radius * 3, 0]}
          mode={mode}
          isSelectable={isSelectable}
          onSelect={onSelect}
          onHoverStart={() => setIsInfoCardHovered(true)}
          onHoverEnd={() => setIsInfoCardHovered(false)}
        />
      )}
    </group>
  );
}
const Planet3DInfoCard = ({
  planet,
  position,
  mode,
  isSelectable,
  onSelect,
  onHoverStart,
  onHoverEnd,
}: {
  planet: Planet;
  position: [number, number, number];
  mode: "view-only" | "mission-target" | "homeworld";
  isSelectable: boolean;
  onSelect?: () => void;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
}) => {
  return (
    <Html position={position}>
      <div
        className={`bg-neutral-900/95 border-2 ${
          isSelectable ? "border-emerald-400/30" : "border-neutral-400/30"
        } p-3 
          -translate-x-1/2 -translate-y-1/2 text-neutral-100 font-sans text-sm 
          pointer-events-auto whitespace-nowrap rounded-md shadow-lg`}
        onMouseEnter={onHoverStart}
        onMouseLeave={onHoverEnd}
      >
        <div className="flex justify-between items-center mb-3">
          <span
            className={`${
              isSelectable ? "text-emerald-400" : "text-neutral-400"
            } text-base font-bold tracking-wide`}
          >
            {planet.name}
          </span>
          <span className="text-emerald-400/60 ml-4 font-mono text-xs">
            [{planet.coordinate_x}, {planet.coordinate_y}]
          </span>
        </div>

        <div className="mb-2 flex items-center">
          <span className="text-neutral-400 mr-2">Size:</span>
          <span className="text-neutral-200">
            {planet.size_km.toLocaleString()} km
          </span>
        </div>

        <div className="mb-2 flex items-center">
          <span className="text-neutral-400 mr-2">Biome:</span>
          <span className="text-neutral-200 capitalize">{planet.biome}</span>
        </div>

        {planet.owner_name && (
          <div className="flex items-center">
            <span className="text-neutral-400 mr-2">Owner:</span>
            <span className="text-neutral-200">{planet.owner_name}</span>
          </div>
        )}

        {mode === "mission-target" && (
          <div className="mt-3">
            {isSelectable ? (
              <button
                onClick={() => onSelect?.()}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-1.5 px-3 rounded-md 
                          transition-colors duration-200 text-sm font-medium"
              >
                Select Target
              </button>
            ) : (
              <div className="text-red-400 text-xs text-center">
                Not available as target
              </div>
            )}
          </div>
        )}

        {mode === "homeworld" && !isSelectable && (
          <div className="mt-2 text-red-400 text-xs">
            Not available as homeworld
          </div>
        )}
      </div>
    </Html>
  );
};

const GridSystem = () => {
  // Create a 2D grid
  return (
    <group>
      {/* Horizontal lines */}
      {Array.from({ length: 21 }, (_, i) => {
        const pos = (i - 10) * 1000; // Lines every 1000 units
        return (
          <line key={`h${i}`}>
            <bufferGeometry
              attach="geometry"
              attributes={{
                position: new THREE.BufferAttribute(
                  new Float32Array([-5000, pos, 0, 5000, pos, 0]),
                  3
                ),
              }}
            />
            <lineBasicMaterial
              attach="material"
              color="rgba(32, 224, 160, 0.15)"
              transparent
              opacity={pos === 0 ? 0.5 : 0.15}
            />
          </line>
        );
      })}

      {/* Vertical lines */}
      {Array.from({ length: 21 }, (_, i) => {
        const pos = (i - 10) * 1000;
        return (
          <line key={`v${i}`}>
            <bufferGeometry
              attach="geometry"
              attributes={{
                position: new THREE.BufferAttribute(
                  new Float32Array([pos, -5000, 0, pos, 5000, 0]),
                  3
                ),
              }}
            />
            <lineBasicMaterial
              attach="material"
              color="rgba(32, 224, 160, 0.15)"
              transparent
              opacity={pos === 0 ? 0.5 : 0.15}
            />
          </line>
        );
      })}
    </group>
  );
};

const FleetMovementTracker = ({
  fleetMovement,
}: {
  fleetMovement: FleetMovement;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const lineRef = useRef<THREE.Line>(null);

  // Calculate current position based on journey progress
  useFrame((state) => {
    if (meshRef.current && lineRef.current) {
      const now = Date.now();
      const startTime = new Date(fleetMovement.departure_time).getTime();
      const endTime = new Date(fleetMovement.arrival_time).getTime();
      const progress = Math.min(
        Math.max((now - startTime) / (endTime - startTime), 0),
        1
      );

      // Lerp between start and end coordinates
      const x = THREE.MathUtils.lerp(
        fleetMovement.origin_x,
        fleetMovement.destination_x,
        progress
      );
      const y = THREE.MathUtils.lerp(
        fleetMovement.origin_y,
        fleetMovement.destination_y,
        progress
      );

      meshRef.current.position.set(x, y, 0);
    }
  });

  return (
    <group>
      {/* Dotted line path */}
      <line ref={lineRef}>
        <bufferGeometry
          attach="geometry"
          attributes={{
            position: new THREE.BufferAttribute(
              new Float32Array([
                fleetMovement.origin_x,
                fleetMovement.origin_y,
                0,
                fleetMovement.destination_x,
                fleetMovement.destination_y,
                0,
              ]),
              3
            ),
          }}
        />
        <lineDashedMaterial
          attach="material"
          color={0x20e0a0}
          dashSize={50}
          gapSize={50}
          opacity={0.4}
          transparent
          linewidth={1}
        />
      </line>

      {/* Fleet marker with info card */}
      <group
        ref={meshRef}
        position={[fleetMovement.origin_x, fleetMovement.origin_y, 0]}
      >
        <mesh>
          <circleGeometry args={[10, 32]} />
          <meshBasicMaterial color={0x20e0a0} transparent opacity={0.8} />
        </mesh>

        <Html position={[20, 0, 0]}>
          <div
            className="bg-neutral-900/95 border border-emerald-400/30 px-2 py-1 
                        text-neutral-100 font-sans text-xs 
                        pointer-events-none whitespace-nowrap rounded-sm"
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-emerald-400">
                → {fleetMovement.destination_name}
              </span>
              <span className="text-neutral-400 text-[10px]">
                Arrival:{" "}
                {formatTimeString(fleetMovement.arrival_time - Date.now())}
              </span>
              {fleetMovement.mission_type && (
                <span className="text-neutral-400 text-[10px] capitalize">
                  {fleetMovement.mission_type}
                </span>
              )}
            </div>
          </div>
        </Html>
      </group>
    </group>
  );
};

interface GalaxyMapProps {
  mode: "view-only" | "mission-target" | "homeworld";
  onPlanetSelect?: (planet: Planet) => void;
  allowedPlanets?: string[];
  highlightedPlanets?: string[];
  focusedPlanet?: Planet | null;
}

const GalaxyMap = ({
  mode = "view-only",
  onPlanetSelect,
  allowedPlanets = [],
  highlightedPlanets = [],
  focusedPlanet = null,
}: GalaxyMapProps) => {
  const { state } = useGame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fleetMovements, setFleetMovements] = useState<FleetMovement[]>([]);
  const controlsRef = useRef<OrbitControls>(null);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    // Initial fetch of fleet movements
    const fetchFleetMovements = async () => {
      const { data } = await supabase
        .from("fleet_movements")
        .select("*")
        .eq("owner_id", state.currentUser?.id)
        .eq("status", "traveling");

      if (data) {
        setFleetMovements(data);
      }
    };

    fetchFleetMovements();

    // Subscribe to fleet movement changes
    const subscription = supabase
      .channel("fleet_movements")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "fleet_movements",
          filter: `owner_id=eq.${state.currentUser?.id}`,
        },
        (payload) => {
          if (payload.eventType === "DELETE") {
            setFleetMovements((current) =>
              current.filter((m) => m.id !== payload.old.id)
            );
          } else {
            const movement = payload.new as FleetMovement;
            setFleetMovements((current) => {
              const updated = [...current];
              const index = updated.findIndex((m) => m.id === movement.id);
              if (index >= 0) {
                updated[index] = movement;
              } else {
                updated.push(movement);
              }
              return updated;
            });
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [state.currentUser?.id]);

  // Add effect to handle focused planet changes
  useEffect(() => {
    if (!focusedPlanet || !controlsRef.current || animating) return;

    const controls = controlsRef.current;
    const camera = controls.object;
    setAnimating(true);

    // Calculate target zoom
    const targetZoom = 0.5;
    const startZoom = controls.zoom;

    // Get current camera position
    const startPosition = new THREE.Vector3();
    camera.getWorldPosition(startPosition);

    // Calculate target position (centered on focused planet)
    const targetPosition = new THREE.Vector3(
      focusedPlanet.coordinate_x,
      focusedPlanet.coordinate_y,
      camera.position.z
    );

    const duration = 1000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (cubic ease-out)
      const easing = 1 - Math.pow(1 - progress, 3);

      // Update camera position and zoom
      controls.zoom = startZoom + (targetZoom - startZoom) * easing;

      camera.position.lerpVectors(startPosition, targetPosition, easing);
      controls.target.set(
        focusedPlanet.coordinate_x,
        focusedPlanet.coordinate_y,
        0
      );

      controls.update();

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setAnimating(false);
      }
    };

    animate();
  }, [focusedPlanet, animating]);

  const handleCanvasClick = (event: any) => {
    if (event.target.tagName === "CANVAS") {
      console.log("Canvas clicked");
    }
  };

  return (
    <div className="relative w-full h-full">
      <Canvas
        ref={canvasRef}
        className="relative"
        orthographic
        camera={{
          position: [0, 0, 1000],
          zoom: 0.1,
          up: [0, 1, 0],
          far: 10000,
        }}
        style={{ width: "100%", height: "100%" }}
        onClick={handleCanvasClick}
      >
        <GridSystem />

        {/* Fleet movements */}
        {fleetMovements.map((fleetMovement) => (
          <FleetMovementTracker
            key={fleetMovement.id}
            fleetMovement={fleetMovement}
          />
        ))}

        {state.planets?.map((planet) => (
          <PlanetObject
            key={planet.id}
            planet={planet}
            isHighlighted={highlightedPlanets.includes(planet.id)}
            isSelectable={
              mode === "view-only" || allowedPlanets.includes(planet.id)
            }
            onSelect={() => onPlanetSelect?.(planet)}
            mode={mode}
          />
        ))}
        <OrbitControls
          ref={controlsRef}
          enableRotate={false}
          enablePan={!animating}
          enableZoom={!animating}
          maxZoom={2}
          minZoom={0.05}
          screenSpacePanning={true}
          mouseButtons={{
            LEFT: THREE.MOUSE.PAN,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.ROTATE,
          }}
          zoomSpeed={0.5}
        />
      </Canvas>
    </div>
  );
};

export default GalaxyMap;
