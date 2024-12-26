import { useGame } from "../contexts/GameContext";
import { FlaskConical, Gem, Hammer, Zap } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useEffect, useState } from "react";

export function ResourceBar() {
  const { state, selectPlanet } = useGame();
  const [currentResources, setCurrentResources] = useState({
    metal: 0,
    crystal: 0,
    deuterium: 0,
    energy: 0,
  });

  useEffect(() => {
    if (!state.resources) return;

    // Initialize with current values
    setCurrentResources({
      metal: state.resources.metal,
      crystal: state.resources.crystal,
      deuterium: state.resources.deuterium,
      energy: state.resources.energy,
    });

    // Update resources every second based on generation rates
    const interval = setInterval(() => {
      const secondsSinceLastUpdate =
        (new Date().getTime() -
          new Date(state.resources.last_update).getTime()) /
        1000;

      setCurrentResources({
        metal:
          state.resources.metal +
          (state.resources.metal_generation_rate / 3600) *
            secondsSinceLastUpdate,
        crystal:
          state.resources.crystal +
          (state.resources.crystal_generation_rate / 3600) *
            secondsSinceLastUpdate,
        deuterium:
          state.resources.deuterium +
          (state.resources.deuterium_generation_rate / 3600) *
            secondsSinceLastUpdate,
        energy:
          state.resources.energy +
          (state.resources.energy_generation_rate / 3600) *
            secondsSinceLastUpdate,
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [state.resources]);

  if (state.selectedPlanet === null) {
    return null;
  }

  return (
    <div className="w-full bg-black/80 border-b border-primary/30 backdrop-blur-sm py-2 px-4 sticky top-0 z-50">
      <div className="flex justify-between items-center">
        <div className="w-72">
          <Select
            value={state.selectedPlanet?.id || ""}
            onValueChange={(value) => {
              const planet = state.userPlanets.find((p) => p.id === value);
              if (planet) selectPlanet(planet);
            }}
          >
            <SelectTrigger className="w-full bg-black border-primary/30 text-primary hover:border-primary/60 transition-colors">
              <SelectValue placeholder="Select Planet" />
            </SelectTrigger>
            <SelectContent className="bg-black/95 border-primary/30">
              {state.userPlanets.map((planet) => (
                <SelectItem
                  key={planet.id}
                  value={planet.id}
                  className="text-primary hover:bg-primary/20"
                >
                  {`> ${planet.name}${
                    planet.is_homeworld ? " (Homeworld)" : ""
                  }`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-end gap-6">
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-end">
              <span className="text-xs text-secondary/70">METAL</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-secondary font-bold">
                  {Math.floor(currentResources.metal)}
                </span>
                <Hammer className="h-4 w-4 text-secondary" />
              </div>
              <span className="text-xs text-secondary font-medium">
                +{state.resources?.metal_generation_rate || 0}
                /h
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex flex-col items-end">
              <span className="text-xs text-accent/70">CRYSTAL</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-accent font-bold">
                  {Math.floor(currentResources.crystal)}
                </span>
                <Gem className="h-4 w-4 text-accent" />
              </div>
              <span className="text-xs text-accent font-medium">
                +{state.resources?.crystal_generation_rate || 0}
                /h
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex flex-col items-end">
              <span className="text-xs text-primary/70">DEUTERIUM</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-primary font-bold">
                  {Math.floor(currentResources.deuterium)}
                </span>
                <FlaskConical className="h-4 w-4 text-primary" />
              </div>
              <span className="text-xs text-primary font-medium">
                +{state.resources?.deuterium_generation_rate || 0}
                /h
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex flex-col items-end">
              <span className="text-xs text-violet-400/70">ENERGY</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-violet-400 font-bold">
                  {Math.floor(currentResources.energy)}
                </span>
                <Zap className="h-4 w-4 text-violet-400" />
              </div>
              <span className="text-xs text-violet-400 font-medium">
                +{state.resources?.energy_generation_rate || 0}
                /h
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
