import { useState, useEffect } from "react";

interface TimerProps {
  startTime: number;
  finishTime: number;
  className?: string;
  showProgressBar?: boolean;
  variant?: "primary" | "secondary" | "accent";
}

export function Timer({
  startTime,
  finishTime,
  className = "",
  showProgressBar = true,
  variant = "primary",
}: TimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [progress, setProgress] = useState(() => {
    // Initialize progress based on current time on mount
    const now = Date.now();
    const total = finishTime - startTime;
    const elapsed = now - startTime;
    return Math.max(0, Math.min(100, (elapsed / total) * 100));
  });

  useEffect(() => {
    const total = finishTime - startTime;

    const updateTimer = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const remaining = Math.max(0, finishTime - now);

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

  const formatTimeString = () => {
    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor(
      (timeRemaining % (1000 * 60 * 60)) / (1000 * 60)
    );
    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

    return [
      days > 0 && `${days}d`,
      hours > 0 && `${hours}h`,
      minutes > 0 && `${minutes}m`,
      `${seconds}s`,
    ]
      .filter(Boolean)
      .join(" ");
  };

  return (
    <div
      className={`p-3 bg-${variant}/10 rounded-lg border border-${variant}/30`}
    >
      <div className="flex items-center">
        <div className="animate-pulse mr-2 w-2 h-2 bg-primary rounded-full"></div>
        <p className={`text-${variant} font-medium`}>
          Time remaining: {formatTimeString()}
        </p>
      </div>
      {showProgressBar && (
        <>
          <div className="mt-2 w-full bg-gray-700 rounded-full h-2 relative">
            <div
              className={`bg-${variant} rounded-full h-2 transition-all duration-500`}
              style={{ width: `${progress}%` }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center text-[10px] text-white/70 font-mono">
              {Math.round(progress)}%
            </div>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            {timeRemaining <= 0 && "Complete!"}
          </p>
        </>
      )}
    </div>
  );
}
