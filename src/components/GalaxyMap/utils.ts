export const lerp = (start: number, end: number, t: number) => {
  return start * (1 - t) + end * t;
};

export const easeOutCubic = (x: number): number => {
  return 1 - Math.pow(1 - x, 3);
};

export const animateViewport = (
  start: { x: number; y: number; zoom: number },
  end: { x: number; y: number; zoom: number },
  duration: number,
  onUpdate: (viewport: { x: number; y: number; zoom: number }) => void,
  onComplete?: () => void
) => {
  const startTime = performance.now();

  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeOutCubic(progress);

    const current = {
      x: lerp(start.x, end.x, eased),
      y: lerp(start.y, end.y, eased),
      zoom: lerp(start.zoom, end.zoom, eased),
    };

    onUpdate(current);

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else if (onComplete) {
      onComplete();
    }
  };

  requestAnimationFrame(animate);
};
