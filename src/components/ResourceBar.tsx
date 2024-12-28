import { useGame } from "../contexts/GameContext";
import { Beaker, Flame, Hammer, Microchip, Zap } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

export function ResourceBar() {
  const { state, selectPlanet, currentResources } = useGame();

  if (state.selectedPlanet === null || !state.resources) {
    return null;
  }
  const energyDeficit =
    state.resources.energy_production - state.resources.energy_consumption;
  let productionMalus = 1;
  if (energyDeficit < 0) {
    // Production scales from 100% at deficit=0 to 0% at deficit=-consumption or below
    productionMalus = 1 - energyDeficit / 100;
  }

  const hourlyGenerationRate = state.resources
    ? {
        metal: Math.floor(
          state.resources.metal_production_rate * 3600 * productionMalus
        ),
        microchips: Math.floor(
          state.resources.microchips_production_rate * 3600 * productionMalus
        ),
        deuterium: Math.floor(
          state.resources.deuterium_production_rate * 3600 * productionMalus
        ),
        science: Math.floor(
          state.resources.science_production_rate * 3600 * productionMalus
        ),
      }
    : {
        metal: 0,
        microchips: 0,
        deuterium: 0,
        energy: 0,
        science: 0,
      };

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
                +{Math.floor(hourlyGenerationRate.metal)}
                /h
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex flex-col items-end">
              <span className="text-xs text-accent/70">MICROCHIPS</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-accent font-bold">
                  {Math.floor(currentResources.microchips)}
                </span>
                <Microchip className="h-4 w-4 text-accent" />
              </div>
              <span className="text-xs text-accent font-medium">
                +{Math.floor(hourlyGenerationRate.microchips)}
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
                <Flame className="h-4 w-4 text-primary" />
              </div>
              <span className="text-xs text-primary font-medium">
                +{Math.floor(hourlyGenerationRate.deuterium)}
                /h
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex flex-col items-end">
              <span className="text-xs text-blue-400/70">SCIENCE</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-blue-400 font-bold">
                  {Math.floor(currentResources.science)}
                </span>
                <Beaker className="h-4 w-4 text-blue-400" />
              </div>
              <span className="text-xs text-blue-400 font-medium">
                +{Math.floor(hourlyGenerationRate.science)}
                /h
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex flex-col items-end">
              <span className="text-xs text-violet-400/70">ENERGY</span>
              <div className="flex items-center gap-2">
                <span
                  className={`font-mono font-bold ${
                    currentResources.energy_production >=
                    currentResources.energy_consumption
                      ? "text-violet-400"
                      : "text-red-400"
                  }`}
                >
                  {Math.floor(
                    currentResources.energy_production -
                      currentResources.energy_consumption
                  )}
                </span>
                <Zap
                  className={`h-4 w-4 ${
                    currentResources.energy_production >=
                    currentResources.energy_consumption
                      ? "text-violet-400"
                      : "text-red-400"
                  }`}
                />
              </div>
              <span className="text-xs font-medium">
                {Number(
                  currentResources.energy_production /
                    currentResources.energy_consumption
                ).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
