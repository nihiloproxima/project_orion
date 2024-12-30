import { TechnologyId } from "./researchs_config";
import { ShipType } from "./ship";

export interface ShipStats {
  speed: {
    min: number;
    max: number;
  };
  cargo_capacity: {
    min: number;
    max: number;
  };
  attack_power: {
    min: number;
    max: number;
  };
  defense: {
    min: number;
    max: number;
  };
}

export interface ShipConfig {
  type: ShipType;
  description: string;
  cost: {
    metal: number;
    deuterium: number;
    microchips: number;
    science: number;
  };
  stats: ShipStats;
  construction_time: number; // Base time in seconds
  requirements: {
    shipyard_level: number;
    technologies: Array<{
      id: TechnologyId;
      level: number;
    }>;
  };
}

export interface ShipsConfig {
  available_ships: {
    [shipType in ShipType]: ShipConfig;
  };
}

export const DEFAULT_SHIPS_CONFIG: ShipsConfig = {
  available_ships: {
    colony_ship: {
      type: "colony_ship",
      description:
        "Required for expanding to new planets. Carries necessary equipment and initial colonists.",
      cost: {
        metal: 10000,
        deuterium: 5000,
        microchips: 2000,
        science: 1000,
      },
      stats: {
        speed: { min: 1800, max: 2200 },
        cargo_capacity: { min: 4500, max: 5500 },
        attack_power: { min: 8, max: 12 },
        defense: { min: 45, max: 55 },
      },
      construction_time: 7200, // 2 hours
      requirements: {
        shipyard_level: 4,
        technologies: [
          {
            id: "colonization_tech",
            level: 1,
          },
        ],
      },
    },
    transport_ship: {
      type: "transport_ship",
      description:
        "Moves resources between planets. Various sizes available for different cargo capacities.",
      cost: {
        metal: 6000,
        deuterium: 3000,
        microchips: 1000,
        science: 500,
      },
      stats: {
        speed: { min: 2800, max: 3200 },
        cargo_capacity: { min: 23000, max: 27000 },
        attack_power: { min: 4, max: 6 },
        defense: { min: 22, max: 28 },
      },
      construction_time: 3600, // 1 hour
      requirements: {
        shipyard_level: 2,
        technologies: [],
      },
    },
    spy_probe: {
      type: "spy_probe",
      description:
        "Gathers intelligence on other planets. Can detect resource levels and structures.",
      cost: {
        metal: 1000,
        deuterium: 1000,
        microchips: 500,
        science: 250,
      },
      stats: {
        speed: { min: 9500, max: 10500 },
        cargo_capacity: { min: 0, max: 0 },
        attack_power: { min: 0, max: 0 },
        defense: { min: 1, max: 1 },
      },
      construction_time: 900, // 15 minutes
      requirements: {
        shipyard_level: 1,
        technologies: [
          {
            id: "espionage_tech",
            level: 1,
          },
        ],
      },
    },
    recycler_ship: {
      type: "recycler_ship",
      description:
        "Specialized for collecting debris after battles and mining asteroids.",
      cost: {
        metal: 8000,
        deuterium: 4000,
        microchips: 1500,
        science: 750,
      },
      stats: {
        speed: { min: 1400, max: 1600 },
        cargo_capacity: { min: 18000, max: 22000 },
        attack_power: { min: 1, max: 1 },
        defense: { min: 18, max: 22 },
      },
      construction_time: 5400, // 1.5 hours
      requirements: {
        shipyard_level: 3,
        technologies: [],
      },
    },
    cruiser: {
      type: "cruiser",
      description:
        "Fast and powerful combat vessels. Excellent for both attack and defense.",
      cost: {
        metal: 15000,
        deuterium: 7500,
        microchips: 3000,
        science: 1500,
      },
      stats: {
        speed: { min: 5800, max: 6200 },
        cargo_capacity: { min: 800, max: 1200 },
        attack_power: { min: 380, max: 420 },
        defense: { min: 180, max: 220 },
      },
      construction_time: 10800, // 3 hours
      requirements: {
        shipyard_level: 5,
        technologies: [
          {
            id: "combat_tech",
            level: 1,
          },
        ],
      },
    },
  },
};
