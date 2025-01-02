import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Planet } from "../../models/planet";

interface PlanetInfoCardProps {
  planet: Planet;
  mode: "homeworld" | "mission-target" | "view-only";
  onClose: () => void;
  onSelect?: () => void;
  viewport: {
    x: number;
    y: number;
    zoom: number;
  };
  position: {
    x: number;
    y: number;
  };
}

export function PlanetInfoCard({
  planet,
  mode,
  onClose,
  onSelect,
  position,
}: PlanetInfoCardProps) {
  const getActionButton = () => {
    switch (mode) {
      case "homeworld":
        return (
          <Button
            size="sm"
            onClick={onSelect}
            className="flex-1 bg-primary hover:bg-primary/80"
          >
            Select Homeworld
          </Button>
        );
      case "mission-target":
        return (
          <Button
            size="sm"
            onClick={onSelect}
            className="flex-1 bg-primary hover:bg-primary/80"
          >
            Select Target
          </Button>
        );
      case "view-only":
      default:
        return null;
    }
  };

  return (
    <div
      className="absolute z-50 pointer-events-auto"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: "translate(-50%, -100%)",
      }}
    >
      <Card className="w-80 bg-black/90 backdrop-blur-sm border-primary/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-primary flex justify-between items-center">
            {planet.name}
            <span className="text-xs font-mono text-primary/60">
              [{planet.coordinate_x}, {planet.coordinate_y}]
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Size: </span>
              <span className="font-mono">
                {planet.size_km.toLocaleString()} km
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Biome: </span>
              <span className="font-mono capitalize">{planet.biome}</span>
            </div>
          </div>

          {planet.owner_id && (
            <div className="text-sm">
              <span className="text-muted-foreground">Status: </span>
              <span className="font-mono text-red-400">Colonized</span>
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="flex-1 border-primary/30 hover:bg-primary/20"
            >
              Close
            </Button>
            {getActionButton()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
