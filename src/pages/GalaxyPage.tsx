import { useNavigate } from "react-router-dom";
import { GalaxyMap2D } from "../components/GalaxyMap2D/GalaxyMap2D";
import { useGame } from "../contexts/GameContext";
import { Planet } from "../models/planet";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
// ... keep other imports ...

export function GalaxyPage() {
  const { state } = useGame();
  const navigate = useNavigate();

  const handlePlanetSelect = (planet: Planet) => {
    navigate(`/planet/${planet.id}`);
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Galaxy Map</CardTitle>
          <CardDescription>
            Explore the known galaxy and its {state.planets?.length || 0}{" "}
            discovered planets
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex justify-center">
            <GalaxyMap2D
              mode="view-only"
              onPlanetSelect={handlePlanetSelect}
              initialZoom={0.5}
              initialCenter={{ x: 0, y: 0 }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
