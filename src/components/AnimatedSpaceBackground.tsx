import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";

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
    <>
      {/* Three.js background with stars */}
      <div className="fixed inset-0 pointer-events-none">
        <Canvas>
          <Stars
            radius={300}
            depth={50}
            count={1000}
            factor={2}
            saturation={0}
            fade
            speed={0.5}
          />
          <gridHelper
            args={[
              2000,
              40,
              "rgba(32, 224, 160, 0.1)",
              "rgba(32, 224, 160, 0.05)",
            ]}
            position={[0, 0, -10]}
          />
          <ambientLight intensity={0.1} />
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
              className="absolute w-full h-full bg-primary rounded-full"
              animate={{
                scale: [1, 2],
                opacity: [0.5, 0],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
              }}
            />
            <motion.div
              className="absolute w-full h-full bg-primary/50 rounded-full"
              animate={{
                scale: [1, 3],
                opacity: [0.3, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
            />
          </motion.div>
        ))}
      </div>
    </>
  );
}
