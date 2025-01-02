import { GalaxyMap2D } from "../GalaxyMap2D/GalaxyMap2D";
// ... keep other imports ...

export function SelectTargetStep({
  onPlanetSelect,
  allowedPlanets,
}: SelectTargetStepProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <GalaxyMap2D
          mode="mission-target"
          onPlanetSelect={onPlanetSelect}
          allowedPlanets={allowedPlanets}
          initialZoom={0.5}
          initialCenter={{ x: 0, y: 0 }}
        />
      </div>
    </div>
  );
}
