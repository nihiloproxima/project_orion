import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Sphere } from "@react-three/drei";
import { Planet } from "../../models/planet";
import * as THREE from "three";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

import normalTexture from "../../assets/textures/planet-normal.jpg";
import diffuseTexture from "../../assets/textures/planet-diffuse.png";

interface PlanetObjectProps {
  planet: Planet;
  isHighlighted: boolean;
  isAllowed: boolean;
  onClick: () => void;
  mode: "homeworld" | "mission-target" | "view-only";
}

const getBiomeColor = (biome: Planet["biome"]) => {
  const colors: Record<string, number> = {
    ocean: 0x38bdf8,
    jungle: 0xeab308,
    desert: 0xf97316,
    ice: 0x22d3ee,
    volcanic: 0xef4444,
  };
  return colors[biome] || 0x20e0a0;
};

const getAtmosphereShader = (color: number) => {
  return {
    uniforms: {
      glowColor: { value: new THREE.Color(color) },
      viewVector: { value: new THREE.Vector3(0, 0, 1) },
    },
    vertexShader: `
      uniform vec3 viewVector;
      varying vec3 vNormal;
      varying vec3 vPositionNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPositionNormal = normalize((modelViewMatrix * vec4(position, 1.0)).xyz);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 glowColor;
      varying vec3 vNormal;
      varying vec3 vPositionNormal;
      void main() {
        float intensity = pow(0.7 - dot(vNormal, vPositionNormal), 2.0);
        gl_FragColor = vec4(glowColor, intensity);
      }
    `,
  };
};

export function PlanetObject({
  planet,
  isHighlighted,
  isAllowed,
  onClick,
  mode,
}: PlanetObjectProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const [showInfo, setShowInfo] = useState(false);
  const size = planet.size_km / 100;

  // Animate planet rotation
  useFrame((state) => {
    if (glowRef.current && state.camera) {
      const viewVector = new THREE.Vector3().subVectors(
        state.camera.position,
        glowRef.current.position
      );
      (
        glowRef.current.material as THREE.ShaderMaterial
      ).uniforms.viewVector.value = viewVector;
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.5 * state.clock.getDelta();
    }
  });

  return (
    <group
      position={[planet.coordinate_x, planet.coordinate_y, planet.coordinate_z]}
      onClick={(e) => {
        e.stopPropagation();
        if (isAllowed) {
          setShowInfo(true);
        }
      }}
    >
      {/* Planet sphere */}
      <Sphere ref={meshRef} args={[size, 64, 64]}>
        <meshStandardMaterial
          color={getBiomeColor(planet.biome)}
          opacity={isAllowed ? 1 : 0.4}
          transparent={true}
          roughness={0.7}
          metalness={0.3}
          bumpMap={new THREE.TextureLoader().load(normalTexture)}
          bumpScale={0.05}
          emissive={getBiomeColor(planet.biome)}
          emissiveIntensity={0.2}
          map={new THREE.TextureLoader().load(diffuseTexture)}
        />
      </Sphere>
      ;{/* Atmosphere glow */}
      <Sphere ref={glowRef} args={[size * 1.2, 64, 64]}>
        <shaderMaterial
          {...getAtmosphereShader(getBiomeColor(planet.biome))}
          transparent
          opacity={0.3}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </Sphere>
      {/* Planet Info Card */}
      {showInfo && (
        <Html position={[0, size * 3, 0]} center>
          <Card className="w-80 bg-black/90 backdrop-blur-sm border-primary/30">
            <CardHeader>
              <CardTitle className="text-lg text-primary">
                {planet.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm">
                <span className="text-muted-foreground">Coordinates: </span>
                <span className="font-mono">
                  [{planet.coordinate_x}, {planet.coordinate_y},{" "}
                  {planet.coordinate_z}]
                </span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Size: </span>
                <span className="font-mono">
                  {planet.size_km.toLocaleString()} km
                </span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Biome: </span>
                <span className="font-mono capitalize">{planet.biome}</span>
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowInfo(false)}
                  className="flex-1"
                >
                  Close
                </Button>
                {mode === "homeworld" && (
                  <Button
                    size="sm"
                    onClick={() => {
                      onClick();
                      setShowInfo(false);
                    }}
                    className="flex-1"
                  >
                    ESTABLISH COLONY
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </Html>
      )}
      {/* Planet Label */}
      <Html
        center
        position={[0, size * 2, 0]}
        className={`pointer-events-none ${
          isHighlighted ? "text-primary" : "text-white"
        } text-sm font-bold`}
        style={{
          opacity: isAllowed ? 1 : 0.4,
        }}
      >
        {planet.name}
      </Html>
    </group>
  );
}
