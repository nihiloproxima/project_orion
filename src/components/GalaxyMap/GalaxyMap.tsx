import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { Suspense } from "react";
import { GalaxyScene } from "./GalaxyScene";
import { Controls } from "./Controls";
import { Planet } from "../../models/planet";

interface GalaxyMapProps {
  mode: "homeworld" | "mission-target" | "view-only";
  onPlanetSelect?: (planet: Planet) => void;
  highlightedPlanets?: string[];
  allowedPlanets?: string[];
  initialZoom?: number;
  initialCenter?: { x: number; y: number };
}

export function GalaxyMap({
  mode,
  onPlanetSelect,
  highlightedPlanets = [],
  allowedPlanets,
  initialCenter = { x: 0, y: 0 },
}: GalaxyMapProps) {
  return (
    <div className="h-[600px] rounded-lg neon-border overflow-hidden">
      <Canvas
        camera={{
          position: [0, 1000, 1000],
          near: 0.1,
          far: 10000,
          fov: 45,
        }}
      >
        <OrbitControls
          enableRotate={false}
          maxDistance={2000}
          minDistance={100}
          maxPolarAngle={Math.PI / 2}
        />

        <color attach="background" args={["#000814"]} />
        <fog attach="fog" args={["#000814", 1000, 3000]} />

        <Suspense fallback={null}>
          <Stars
            radius={1000}
            depth={50}
            count={5000}
            factor={4}
            saturation={0}
            fade
            speed={1}
          />

          <GalaxyScene
            mode={mode}
            onPlanetSelect={onPlanetSelect}
            highlightedPlanets={highlightedPlanets}
            allowedPlanets={allowedPlanets}
            initialCenter={initialCenter}
          />
        </Suspense>

        <Controls />
      </Canvas>
    </div>
  );
}
