import { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useGame } from "../../contexts/GameContext";
import { Planet as PlanetType } from "../../models/planet";
import { PlanetObject } from "./PlanetObject";
import { Grid } from "./Grid";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface GalaxySceneProps {
  mode: "homeworld" | "mission-target" | "view-only";
  onPlanetSelect?: (planet: PlanetType) => void;
  highlightedPlanets?: string[];
  allowedPlanets?: string[];
  initialCenter?: { x: number; y: number };
}

export function GalaxyScene({
  mode,
  onPlanetSelect,
  highlightedPlanets = [],
  allowedPlanets,
}: GalaxySceneProps) {
  const { state } = useGame();
  const groupRef = useRef<THREE.Group>(null);
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetType | null>(null);

  // Create instanced meshes for better performance
  const planets = useMemo(() => {
    if (!state.planets) return [];

    return state.planets.map((planet) => ({
      ...planet,
      position: new THREE.Vector3(
        planet.coordinate_x,
        planet.coordinate_y,
        planet.coordinate_z
      ),
      isHighlighted: highlightedPlanets.includes(planet.id),
      isAllowed: !allowedPlanets || allowedPlanets.includes(planet.id),
    }));
  }, [state.planets, highlightedPlanets, allowedPlanets]);

  // Handle camera movement
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.05;
    }
  });

  // Get action button text based on mode
  const getActionButtonText = () => {
    switch (mode) {
      case "homeworld":
        return "ESTABLISH COLONY";
      case "mission-target":
        return "SELECT TARGET";
      default:
        return null;
    }
  };

  return (
    <group>
      <Grid />

      {planets.map((planet) => (
        <PlanetObject
          key={planet.id}
          planet={planet}
          isHighlighted={
            planet.isHighlighted || planet.id === selectedPlanet?.id
          }
          isAllowed={planet.isAllowed}
          onClick={() => {
            if (planet.isAllowed) {
              setSelectedPlanet(planet);
              if (onPlanetSelect) {
                onPlanetSelect(planet);
              }
            }
          }}
        />
      ))}

      {/* Planet Info Card */}
      {selectedPlanet && (
        <Html
          position={[
            selectedPlanet.coordinate_x,
            selectedPlanet.coordinate_y + 50,
            selectedPlanet.coordinate_z,
          ]}
        >
          <Card className="w-80 bg-black/90 backdrop-blur-sm border-primary/30">
            <CardHeader>
              <CardTitle className="text-lg text-primary">
                {selectedPlanet.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm">
                <span className="text-muted-foreground">Coordinates: </span>
                <span className="font-mono">
                  [{selectedPlanet.coordinate_x}, {selectedPlanet.coordinate_y},{" "}
                  {selectedPlanet.coordinate_z}]
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
                <span className="font-mono capitalize">
                  {selectedPlanet.biome}
                </span>
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedPlanet(null)}
                  className="flex-1"
                >
                  Close
                </Button>
                {getActionButtonText() && (
                  <Button
                    size="sm"
                    onClick={() => {
                      if (onPlanetSelect) {
                        onPlanetSelect(selectedPlanet);
                        setSelectedPlanet(null);
                      }
                    }}
                    className="flex-1"
                  >
                    {getActionButtonText()}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </Html>
      )}
    </group>
  );
}
