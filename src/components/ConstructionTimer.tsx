import { useState, useEffect } from "react";

interface ConstructionTimerProps {
  startTime: number;
  finishTime: number;
}

export function ConstructionTimer({
  startTime,
  finishTime,
}: ConstructionTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const finishTimeMs = finishTime;
    const startTimeMs = startTime;
    const total = finishTimeMs - startTimeMs;

    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, finishTimeMs - now);
      const elapsed = now - startTimeMs;

      setTimeRemaining(remaining);
      setProgress(Math.max(0, Math.min(100, (elapsed / total) * 100)));

      if (remaining > 0) {
        requestAnimationFrame(updateTimer);
      }
    };

    const animationId = requestAnimationFrame(updateTimer);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [startTime, finishTime]);

  const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

  const timeString = [
    days > 0 && `${days}d`,
    hours > 0 && `${hours}h`,
    minutes > 0 && `${minutes}m`,
    `${seconds}s`,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="space-y-2">
      <div className="text-sm font-mono text-primary/70">
        Time remaining: {timeString}
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
        <div className="absolute inset-0 flex items-center justify-center text-[10px] text-primary/70 font-mono">
          {Math.round(progress)}%
        </div>
      </div>
    </div>
  );
}
