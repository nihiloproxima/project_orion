import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface GridDot {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
}

interface FleetSimulation {
  id: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  duration: number;
  delay: number;
}

export function AnimatedBackground() {
  const [dots, setDots] = useState<GridDot[]>([]);
  const [fleets, setFleets] = useState<FleetSimulation[]>([]);

  useEffect(() => {
    // Generate grid dots
    const newDots: GridDot[] = [];
    const spacing = 50;
    const rows = Math.ceil(window.innerHeight / spacing);
    const cols = Math.ceil(window.innerWidth / spacing);

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        newDots.push({
          id: i * cols + j,
          x: j * spacing,
          y: i * spacing,
          size: Math.random() * 2 + 1,
          delay: Math.random() * 2,
        });
      }
    }
    setDots(newDots);

    // Generate simulated fleet movements
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
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Animated grid dots */}
      {dots.map((dot) => (
        <motion.div
          key={dot.id}
          className="absolute rounded-full bg-primary/20"
          style={{
            left: dot.x,
            top: dot.y,
            width: dot.size,
            height: dot.size,
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 3,
            delay: dot.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Simulated fleet movements */}
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

      {/* Grid lines */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--primary)/5 1px, transparent 1px),
            linear-gradient(to bottom, var(--primary)/5 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />
    </div>
  );
}
