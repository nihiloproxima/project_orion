import { ResourceType } from "./planets_resources";

export interface StructureConfig {
  // Cost configuration for building and upgrading
  cost: {
    resources: {
      metal: number;
      deuterium: number;
      microchips: number;
      science: number;
    };
    percent_increase_per_level: number;
  };

  production: {
    base: number;
    percent_increase_per_level: number;
    resource: ResourceType | null;
  };

  time: {
    base_seconds: number;
    percent_increase_per_level: number;
    max_seconds: number;
  };

  energy_consumption: {
    base: number;
    percent_increase_per_level: number;
  };
}

export interface GameStructuresConfig {
  metal_mine: StructureConfig;
  energy_plant: StructureConfig;
  deuterium_synthesizer: StructureConfig;
  research_lab: StructureConfig;
  shipyard: StructureConfig;
  defense_factory: StructureConfig;
  microchip_factory: StructureConfig;
}

// Default configuration values
export const DEFAULT_STRUCTURES_CONFIG: GameStructuresConfig = {
  metal_mine: {
    cost: {
      resources: {
        metal: 400, // Affordable with starting 500 metal
        deuterium: 0,
        microchips: 0,
        science: 0,
      },
      percent_increase_per_level: 50,
    },
    production: {
      base: 1,
      percent_increase_per_level: 50,
      resource: "metal",
    },
    time: {
      base_seconds: 30,
      percent_increase_per_level: 50,
      max_seconds: 86400,
    },
    energy_consumption: {
      base: 10,
      percent_increase_per_level: 50,
    },
  },
  energy_plant: {
    cost: {
      resources: {
        metal: 100,
        deuterium: 0,
        microchips: 0,
        science: 0,
      },
      percent_increase_per_level: 5,
    },
    production: {
      base: 50,
      percent_increase_per_level: 20,
      resource: "energy",
    },
    time: {
      base_seconds: 45,
      percent_increase_per_level: 50,
      max_seconds: 86400,
    },
    energy_consumption: {
      base: 0,
      percent_increase_per_level: 0,
    },
  },
  deuterium_synthesizer: {
    cost: {
      resources: {
        metal: 600,
        deuterium: 0,
        microchips: 0,
        science: 0,
      },
      percent_increase_per_level: 70,
    },
    production: {
      base: 0.1,
      percent_increase_per_level: 50,
      resource: "deuterium",
    },
    time: {
      base_seconds: 120,
      percent_increase_per_level: 50,
      max_seconds: 86400,
    },
    energy_consumption: {
      base: 20,
      percent_increase_per_level: 75,
    },
  },
  research_lab: {
    cost: {
      resources: {
        metal: 2500,
        deuterium: 500,
        microchips: 0,
        science: 0,
      },
      percent_increase_per_level: 80,
    },
    production: {
      base: 0.0014,
      percent_increase_per_level: 57,
      resource: "science",
    },
    time: {
      base_seconds: 1800,
      percent_increase_per_level: 50,
      max_seconds: 86400,
    },
    energy_consumption: {
      base: 15,
      percent_increase_per_level: 67,
    },
  },
  shipyard: {
    cost: {
      resources: {
        metal: 5000,
        deuterium: 1000,
        microchips: 2000,
        science: 500,
      },
      percent_increase_per_level: 60,
    },
    production: {
      base: 0,
      percent_increase_per_level: 0,
      resource: null,
    },
    time: {
      base_seconds: 2400,
      percent_increase_per_level: 50,
      max_seconds: 86400,
    },
    energy_consumption: {
      base: 100,
      percent_increase_per_level: 50,
    },
  },
  defense_factory: {
    cost: {
      resources: {
        metal: 4000,
        deuterium: 750,
        microchips: 1500,
        science: 400,
      },
      percent_increase_per_level: 50,
    },
    production: {
      base: 0,
      percent_increase_per_level: 0,
      resource: null,
    },
    time: {
      base_seconds: 2100,
      percent_increase_per_level: 50,
      max_seconds: 86400,
    },
    energy_consumption: {
      base: 80,
      percent_increase_per_level: 50,
    },
  },
  microchip_factory: {
    cost: {
      resources: {
        metal: 1000,
        deuterium: 0,
        microchips: 0,
        science: 100,
      },
      percent_increase_per_level: 60,
    },
    production: {
      base: 0.005,
      percent_increase_per_level: 50,
      resource: "microchips",
    },
    time: {
      base_seconds: 600,
      percent_increase_per_level: 50,
      max_seconds: 86400,
    },
    energy_consumption: {
      base: 50,
      percent_increase_per_level: 50,
    },
  },
};
