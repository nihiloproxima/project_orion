import { useState, useEffect } from "react";
import { Progress } from "./ui/progress";

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
    const remaining = finishTime - now;
    return Math.max(0, Math.min(100, ((total - remaining) / total) * 100));
  });

  useEffect(() => {
    const total = finishTime - startTime;

    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, finishTime - now);

      setTimeRemaining(remaining);
      // Calculate progress as percentage of remaining time
      const progressPercent = Math.max(
        0,
        Math.min(100, ((total - remaining) / total) * 100)
      );
      setProgress(progressPercent);

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
          <div className="mt-3 relative">
            <Progress
              value={progress}
              className="h-3 bg-background/30 [&>div]:bg-primary/80"
            />
            <div className="absolute inset-0 flex items-center justify-center text-xs font-mono text-white/90">
              {Math.round(progress)}%
            </div>
          </div>
          <p className="text-muted-foreground text-sm mt-2">
            {timeRemaining <= 0 && "Complete!"}
          </p>
        </>
      )}
    </div>
  );
}
