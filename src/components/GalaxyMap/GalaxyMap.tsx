import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars, PerspectiveCamera } from "@react-three/drei";
import { Suspense, useEffect, useRef } from "react";
import { GalaxyScene } from "./GalaxyScene";
import { Controls } from "./Controls";
import { Planet } from "../../models/planet";
import { GALAXY_GRID } from "../../constants/game";
import * as THREE from "three";

interface GalaxyMapProps {
  mode: "homeworld" | "mission-target" | "view-only";
  onPlanetSelect?: (planet: Planet) => void;
  highlightedPlanets?: string[];
  allowedPlanets?: string[];
  initialZoom?: number;
  initialCenter?: { x: number; y: number; z: number };
}

export function GalaxyMap({
  mode,
  onPlanetSelect,
  highlightedPlanets = [],
  allowedPlanets,
  initialZoom = 1,
  initialCenter = { x: 0, y: 0, z: 0 },
}: GalaxyMapProps) {
  const controlsRef = useRef<any>(null);

  // Calculate camera position based on zoom level
  const cameraPosition = new THREE.Vector3(
    GALAXY_GRID.SIZE / 4,
    GALAXY_GRID.SIZE / 4,
    GALAXY_GRID.SIZE / 4
  );

  // Set up camera when component mounts or initialZoom/initialCenter changes
  useEffect(() => {
    if (controlsRef.current) {
      // Set camera position
      controlsRef.current.object.position.copy(cameraPosition);

      // Set target to look at initial center
      controlsRef.current.target.set(
        initialCenter.x,
        initialCenter.y,
        initialCenter.z
      );

      // Update controls
      controlsRef.current.update();
    }
  }, [initialZoom, initialCenter, cameraPosition]);

  return (
    <div className="h-[600px] rounded-lg neon-border overflow-hidden">
      <Canvas>
        <PerspectiveCamera
          makeDefault
          position={cameraPosition.toArray()}
          near={1}
          far={50000}
          fov={75}
        />

        <OrbitControls
          ref={controlsRef}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={GALAXY_GRID.MIN_ZOOM}
          maxDistance={GALAXY_GRID.MAX_ZOOM}
          zoomSpeed={1}
          panSpeed={1}
          rotateSpeed={0.5}
          target={[0, 0, 0]}
          dampingFactor={0.1}
          enableDamping={true}
        />

        <color attach="background" args={["#000814"]} />
        <fog attach="fog" args={["#000814", 2000, 8000]} />

        {/* Add subtle ambient light */}
        <ambientLight intensity={0.1} />

        {/* Add directional light to simulate a distant star */}
        <directionalLight position={[0, 0, 0]} intensity={0.5} />

        <Suspense fallback={null}>
          {/* Background stars */}
          <Stars
            radius={5000}
            depth={500}
            count={10000}
            factor={4}
            saturation={0}
            fade
            speed={1}
          />

          {/* Galaxy grid cube visualization */}
          {/* <gridHelper
            args={[GALAXY_GRID.SIZE, GALAXY_GRID.SIZE / GALAXY_GRID.CELL_SIZE]}
            position={[0, 0, 0]}
          />
          <gridHelper
            args={[GALAXY_GRID.SIZE, GALAXY_GRID.SIZE / GALAXY_GRID.CELL_SIZE]}
            position={[0, 0, 0]}
            rotation={[Math.PI / 2, 0, 0]}
          />
          <gridHelper
            args={[GALAXY_GRID.SIZE, GALAXY_GRID.SIZE / GALAXY_GRID.CELL_SIZE]}
            position={[0, 0, 0]}
            rotation={[0, 0, Math.PI / 2]}
          /> */}

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
