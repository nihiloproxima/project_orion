import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { useGame } from "../contexts/GameContext";
import { Eye } from "lucide-react";
import { GalaxyMap2D } from "../components/GalaxyMap2D/GalaxyMap2D";

export function GalaxyObservation() {
  const { state } = useGame();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold neon-text mb-2 flex items-center gap-2">
            <Eye className="h-8 w-8" />
            GALAXY OBSERVATION
          </h1>
          <p className="text-muted-foreground">
            Monitor and analyze the galaxy map
          </p>
        </div>
      </div>

      <Card className="border-2 shadow-2xl shadow-primary/20">
        <CardHeader className="border-b bg-gray-900">
          <CardTitle className="text-xl">
            Known Systems: {state.planets?.length || 0}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <GalaxyMap2D
            mode="view-only"
            initialZoom={0.3}
            initialCenter={{ x: 0, y: 0 }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
