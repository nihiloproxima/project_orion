import { useEffect, useState } from "react";
import { Terminal } from "lucide-react";

const LOADING_MESSAGES = [
  "INITIALIZING SYSTEM...",
  "ESTABLISHING CONNECTION...",
  "SCANNING STAR SYSTEMS...",
  "LOADING PLANET DATA...",
  "FETCHING RESOURCES...",
  "LOADING RESEARCH STATUS...",
  "CHECKING STRUCTURES...",
  "INITIALIZING GAME STATE...",
];

export function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(0);

  useEffect(() => {
    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1;
      });
    }, 30); // 3000ms / 100 steps = 30ms per step

    // Cycle through messages
    const messageInterval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 375);

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background cyber-grid flex items-center justify-center">
      <div className="absolute inset-0 bg-primary/5 blur-[100px] rounded-full" />

      <div className="w-[600px] space-y-8 z-10">
        {/* Header */}
        <div className="flex items-center justify-center gap-2">
          <Terminal className="h-8 w-8 text-primary animate-pulse" />
          <h1 className="text-4xl font-bold neon-text tracking-wider">
            SYSTEM BOOT SEQUENCE
          </h1>
        </div>

        {/* Matrix-like effect overlay */}
        <div className="relative h-[300px] border border-primary/30 bg-black/80 overflow-hidden font-mono">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,255,0,0.03)1px,transparent_1px)] bg-[size:100%_2px] animate-matrix-rain" />

          {/* Scrolling terminal text */}
          <div className="p-4 space-y-2 text-primary/70">
            {LOADING_MESSAGES.map((msg, i) => (
              <div
                key={i}
                className={`transition-opacity duration-500 ${
                  i === currentMessage ? "opacity-100" : "opacity-30"
                }`}
              >
                {"> "}
                {msg}
              </div>
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-primary/70 font-mono">
            <span>INITIALIZATION PROGRESS</span>
            <span>{progress}%</span>
          </div>
          <div className="relative h-2 bg-primary/10 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-primary/30"
              style={{ width: `${progress}%` }}
            />
            <div
              className="absolute inset-y-0 left-0 bg-primary animate-pulse"
              style={{
                width: "2px",
                left: `${progress}%`,
                boxShadow:
                  "0 0 10px theme(colors.primary.DEFAULT), 0 0 5px theme(colors.primary.DEFAULT)",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
