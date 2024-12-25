import { useGame } from "../contexts/GameContext";
import { Planet, ShipType, Ship } from "../types/game";
import { SHIP_STATS } from "../lib/constants";
import { v4 as uuidv4 } from "uuid";

interface ShipCosts {
  METAL: number;
  ENERGY: number;
  DEUTERIUM: number;
}

const SHIP_COSTS: Record<ShipType, ShipCosts> = {
  COLONY_SHIP: { METAL: 10000, ENERGY: 5000, DEUTERIUM: 2500 },
  TRANSPORT_SHIP: { METAL: 6000, ENERGY: 3000, DEUTERIUM: 1500 },
  SPY_PROBE: { METAL: 1000, ENERGY: 500, DEUTERIUM: 100 },
  RECYCLER: { METAL: 8000, ENERGY: 4000, DEUTERIUM: 2000 },
  CRUISER: { METAL: 20000, ENERGY: 10000, DEUTERIUM: 5000 },
};

export function useShipyard(planet: Planet) {
  const { dispatch } = useGame();

  const canBuildShip = (shipType: ShipType): boolean => {
    const costs = SHIP_COSTS[shipType];
    return Object.entries(costs).every(
      ([resource, cost]) =>
        planet.resources[resource as keyof ShipCosts] >= cost
    );
  };

  const buildShip = async (shipType: ShipType): Promise<boolean> => {
    if (!canBuildShip(shipType)) {
      return false;
    }

    // Deduct resources
    const newResources = { ...planet.resources };
    Object.entries(SHIP_COSTS[shipType]).forEach(([resource, cost]) => {
      newResources[resource as keyof ShipCosts] -= cost;
    });

    // Create new ship
    const newShip: Ship = {
      id: uuidv4(),
      type: shipType,
      ...SHIP_STATS[shipType],
      status: "STATIONED",
    };

    // Update game state
    dispatch({
      type: "UPDATE_RESOURCES",
      payload: { planetId: planet.id, resources: newResources },
    });

    dispatch({
      type: "ADD_SHIP",
      payload: { planetId: planet.id, ship: newShip },
    });

    return true;
  };

  return { canBuildShip, buildShip };
}
