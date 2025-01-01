import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Sphere } from "@react-three/drei";
import { Planet } from "../../models/planet";
import * as THREE from "three";

interface PlanetObjectProps {
  planet: Planet;
  isHighlighted: boolean;
  isAllowed: boolean;
  onClick: () => void;
}

export function PlanetObject({
  planet,
  isHighlighted,
  isAllowed,
  onClick,
}: PlanetObjectProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  const planetMaterial = useMemo(() => {
    const color = getBiomeColor(planet.biome);
    return new THREE.MeshStandardMaterial({
      color,
      opacity: isAllowed ? 1 : 0.4,
      transparent: true,
      roughness: 0.7,
      metalness: 0.3,
    });
  }, [planet.biome, isAllowed]);

  const glowMaterial = useMemo(() => {
    const color = getBiomeColor(planet.biome);
    return new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(color) },
        viewVector: { value: new THREE.Vector3() },
      },
      vertexShader: `
        uniform vec3 viewVector;
        varying float intensity;
        void main() {
          vec3 vNormal = normalize(normalMatrix * normal);
          vec3 vNormel = normalize(normalMatrix * viewVector);
          intensity = pow(0.7 - dot(vNormal, vNormel), 2.0);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        varying float intensity;
        void main() {
          gl_FragColor = vec4(color, 1.0) * intensity;
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
    });
  }, [planet.biome]);

  useFrame(({ camera }) => {
    if (glowRef.current && glowMaterial.uniforms) {
      glowMaterial.uniforms.viewVector.value = new THREE.Vector3().subVectors(
        camera.position,
        glowRef.current.position
      );
    }
  });

  const size = planet.size_km / 1000; // Scale down for visualization

  return (
    <group
      position={[planet.coordinate_x, 0, planet.coordinate_y]}
      onClick={onClick}
    >
      <Sphere ref={meshRef} args={[size, 32, 32]} material={planetMaterial} />

      <Sphere
        ref={glowRef}
        args={[size * 1.2, 32, 32]}
        material={glowMaterial}
      />

      {/* Planet Label */}
      <Html
        center
        position={[0, size * 1.5, 0]}
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

function getBiomeColor(biome: string): string {
  const colors: Record<string, string> = {
    desert: "#C2B280",
    ocean: "#4169E1",
    forest: "#228B22",
    ice: "#B0E0E6",
    volcanic: "#8B0000",
    gas: "#9370DB",
    terran: "#6495ED",
  };
  return colors[biome] || "#808080";
}
