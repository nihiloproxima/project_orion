import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";

interface FleetSimulation {
  id: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  duration: number;
  delay: number;
}

export function AnimatedSpaceBackground() {
  const [fleets, setFleets] = useState<FleetSimulation[]>([]);

  useEffect(() => {
    const generateFleetMovement = () => {
      const newFleets: FleetSimulation[] = [];
      for (let i = 0; i < 5; i++) {
        newFleets.push({
          id: i,
          startX: Math.random() * window.innerWidth,
          startY: Math.random() * window.innerHeight,
          endX: Math.random() * window.innerWidth,
          endY: Math.random() * window.innerHeight,
          duration: Math.random() * 10 + 10,
          delay: Math.random() * 5,
        });
      }
      setFleets(newFleets);
    };

    generateFleetMovement();
    const interval = setInterval(generateFleetMovement, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-0">
      {/* Make the Canvas container pointer-events-none */}
      <div className="fixed inset-0 pointer-events-none">
        <Canvas
          camera={{ position: [0, 0, 1] }}
          style={{ pointerEvents: "none" }}
        >
          <Stars
            radius={100}
            depth={50}
            count={5000}
            factor={4}
            saturation={0}
            fade
            speed={1}
          />
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -20, 0]}>
            <planeGeometry args={[100, 100, 50, 50]} />
            <meshBasicMaterial
              color={new THREE.Color("#20e0a0")}
              wireframe
              transparent
              opacity={0.1}
            />
          </mesh>
          <ambientLight intensity={0.5} />
        </Canvas>
      </div>

      {/* Animated fleet movements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {fleets.map((fleet) => (
          <motion.div
            key={fleet.id}
            className="absolute w-2 h-2"
            initial={{
              x: fleet.startX,
              y: fleet.startY,
              opacity: 0,
            }}
            animate={{
              x: fleet.endX,
              y: fleet.endY,
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: fleet.duration,
              delay: fleet.delay,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {/* Fleet trail effect */}
            <motion.div
              className="absolute w-full h-full bg-primary rounded-full shadow-glow"
              animate={{
                scale: [1, 2],
                opacity: [0.8, 0],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
              }}
            />
            <motion.div
              className="absolute w-full h-full bg-primary/50 rounded-full shadow-glow"
              animate={{
                scale: [1, 3],
                opacity: [0.5, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
            />
          </motion.div>
        ))}
      </div>

      <style jsx>{`
        .shadow-glow {
          box-shadow: 0 0 10px #20e0a0, 0 0 20px #20e0a0, 0 0 30px #20e0a0;
        }
      `}</style>
    </div>
  );
}
