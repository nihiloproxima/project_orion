import { BiomeType, ResourceType, ShipType } from "../types/game";

export const RESOURCE_BONUSES: Record<
  BiomeType,
  { primary: [ResourceType, number]; secondary: [ResourceType, number] }
> = {
  WATER_WORLD: { primary: ["DEUTERIUM", 0.2], secondary: ["ENERGY", 0.1] },
  ARID: { primary: ["METAL", 0.15], secondary: ["SCIENCE", 0.1] },
  DESERT: { primary: ["ENERGY", 0.2], secondary: ["METAL", 0.05] },
  ICE: { primary: ["DEUTERIUM", 0.25], secondary: ["SCIENCE", 0.05] },
  GAS_GIANT: { primary: ["ENERGY", 0.3], secondary: ["DEUTERIUM", 0.15] },
  SUN_LIKE: { primary: ["ENERGY", 0.25], secondary: ["SCIENCE", 0.2] },
};

export const SHIP_STATS: Record<
  ShipType,
  {
    attack: number;
    defense: number;
    speed: number;
    cargoCapacity: number;
  }
> = {
  COLONY_SHIP: {
    attack: 10,
    defense: 50,
    speed: 2000,
    cargoCapacity: 5000,
  },
  TRANSPORT_SHIP: {
    attack: 5,
    defense: 25,
    speed: 3000,
    cargoCapacity: 25000,
  },
  SPY_PROBE: {
    attack: 0,
    defense: 1,
    speed: 10000,
    cargoCapacity: 0,
  },
  RECYCLER: {
    attack: 1,
    defense: 20,
    speed: 1500,
    cargoCapacity: 20000,
  },
  CRUISER: {
    attack: 400,
    defense: 200,
    speed: 6000,
    cargoCapacity: 1000,
  },
};
