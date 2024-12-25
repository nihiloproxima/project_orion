import { useGame } from "../contexts/GameContext";
import {
  CircleDollarSign,
  Database,
  FlaskConical,
  Gem,
  Hammer,
  Zap,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

export function ResourceBar() {
  const { state, selectPlanet } = useGame();

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
                  {state.resources?.metal || 0}
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
                  {state.resources?.crystal || 0}
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
                  {state.resources?.deuterium || 0}
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
                  {state.resources?.energy || 0}
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
