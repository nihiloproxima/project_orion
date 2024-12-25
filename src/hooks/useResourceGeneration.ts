import { useEffect } from "react";
import { useGame } from "../contexts/GameContext";
import { Planet, ResourceType } from "../types/game";
import { RESOURCE_BONUSES } from "../lib/constants";

const BASE_PRODUCTION_RATE = 100; // Base units per hour
const TICK_INTERVAL = 1000; // Update every second

export function useResourceGeneration(planet: Planet) {
  const { dispatch } = useGame();

  useEffect(() => {
    if (!planet) return;

    const calculateProduction = () => {
      const newResources = { ...planet.resources };
      const biomeBonus = RESOURCE_BONUSES[planet.biome];

      // Calculate production for each resource
      Object.entries(newResources).forEach(([resource, amount]) => {
        const resourceType = resource as ResourceType;
        let bonus = 1;

        // Apply biome bonuses
        if (biomeBonus.primary[0] === resourceType) {
          bonus += biomeBonus.primary[1];
        } else if (biomeBonus.secondary[0] === resourceType) {
          bonus += biomeBonus.secondary[1];
        }

        // Calculate structure bonuses
        const productionStructures = planet.structures.filter((structure) =>
          structure.type.startsWith(resourceType.toLowerCase())
        );

        const structureBonus = productionStructures.reduce(
          (acc, structure) => acc + structure.level * 0.1,
          0
        );

        // Calculate hourly production and convert to per-tick
        const hourlyProduction =
          BASE_PRODUCTION_RATE * bonus * (1 + structureBonus);
        const tickProduction =
          (hourlyProduction / 3600) * (TICK_INTERVAL / 1000);

        newResources[resourceType] = amount + tickProduction;
      });

      dispatch({
        type: "UPDATE_RESOURCES",
        payload: { planetId: planet.id, resources: newResources },
      });
    };

    const interval = setInterval(calculateProduction, TICK_INTERVAL);
    return () => clearInterval(interval);
  }, [planet, dispatch]);
}
