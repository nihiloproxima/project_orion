import { ResourceType } from "./planets_resources";
import { StructureType } from "./structure";

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
    base: number | null;
    percent_increase_per_level: number | null;
    resource: ResourceType | null;
  };

  storage: {
    increase_per_level: number | null;
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

export interface StructuresConfig {
  available_structures: {
    [structureType in StructureType]: StructureConfig;
  };
}

// Default configuration values
export const DEFAULT_STRUCTURES_CONFIG: StructuresConfig = {
  available_structures: {
    metal_mine: {
      cost: {
        resources: {
          metal: 400, // Affordable with starting 500 metal
          deuterium: 0,
          microchips: 0,
          science: 0,
        },
        percent_increase_per_level: 10,
      },
      production: {
        base: 1,
        percent_increase_per_level: 50,
        resource: "metal",
      },
      storage: {
        increase_per_level: null,
        resource: null,
      },
      time: {
        base_seconds: 10,
        percent_increase_per_level: 30,
        max_seconds: 86400,
      },
      energy_consumption: {
        base: 10,
        percent_increase_per_level: 25,
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
        percent_increase_per_level: 100,
      },
      production: {
        base: 50,
        percent_increase_per_level: 100,
        resource: "energy",
      },
      storage: {
        increase_per_level: null,
        resource: null,
      },
      time: {
        base_seconds: 30,
        percent_increase_per_level: 25,
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
        base: 0.5,
        percent_increase_per_level: 50,
        resource: "deuterium",
      },
      storage: {
        increase_per_level: null,
        resource: null,
      },
      time: {
        base_seconds: 30,
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
        base: 0.5,
        percent_increase_per_level: 25,
        resource: "science",
      },
      storage: {
        increase_per_level: null,
        resource: null,
      },
      time: {
        base_seconds: 60,
        percent_increase_per_level: 300,
        max_seconds: 86400,
      },
      energy_consumption: {
        base: 15,
        percent_increase_per_level: 200,
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
        base: null,
        percent_increase_per_level: null,
        resource: null,
      },
      storage: {
        increase_per_level: null,
        resource: null,
      },
      time: {
        base_seconds: 300,
        percent_increase_per_level: 500,
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
        base: null,
        percent_increase_per_level: null,
        resource: null,
      },
      storage: {
        increase_per_level: null,
        resource: null,
      },
      time: {
        base_seconds: 3600,
        percent_increase_per_level: 500,
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
        percent_increase_per_level: 50,
      },
      production: {
        base: 0.5,
        percent_increase_per_level: 100,
        resource: "microchips",
      },
      storage: {
        increase_per_level: null,
        resource: null,
      },
      time: {
        base_seconds: 300,
        percent_increase_per_level: 500,
        max_seconds: 86400,
      },
      energy_consumption: {
        base: 50,
        percent_increase_per_level: 50,
      },
    },
    metal_hangar: {
      cost: {
        resources: {
          metal: 1000,
          deuterium: 0,
          microchips: 0,
          science: 0,
        },
        percent_increase_per_level: 75,
      },
      production: {
        base: null,
        percent_increase_per_level: null,
        resource: null,
      },
      storage: {
        increase_per_level: 10000,
        resource: "metal",
      },
      time: {
        base_seconds: 600,
        percent_increase_per_level: 50,
        max_seconds: 86400,
      },
      energy_consumption: {
        base: 5,
        percent_increase_per_level: 25,
      },
    },
    deuterium_tank: {
      cost: {
        resources: {
          metal: 1500,
          deuterium: 500,
          microchips: 0,
          science: 0,
        },
        percent_increase_per_level: 75,
      },
      production: {
        base: null,
        percent_increase_per_level: null,
        resource: null,
      },
      storage: {
        increase_per_level: 5000,
        resource: "deuterium",
      },
      time: {
        base_seconds: 900,
        percent_increase_per_level: 50,
        max_seconds: 86400,
      },
      energy_consumption: {
        base: 10,
        percent_increase_per_level: 25,
      },
    },
    microchip_vault: {
      cost: {
        resources: {
          metal: 2000,
          deuterium: 0,
          microchips: 500,
          science: 100,
        },
        percent_increase_per_level: 75,
      },
      production: {
        base: null,
        percent_increase_per_level: null,
        resource: null,
      },
      storage: {
        increase_per_level: 2500,
        resource: "microchips",
      },
      time: {
        base_seconds: 1200,
        percent_increase_per_level: 50,
        max_seconds: 86400,
      },
      energy_consumption: {
        base: 15,
        percent_increase_per_level: 25,
      },
    },
    data_center: {
      cost: {
        resources: {
          metal: 2500,
          deuterium: 1000,
          microchips: 1000,
          science: 250,
        },
        percent_increase_per_level: 75,
      },
      production: {
        base: 0,
        percent_increase_per_level: 0,
        resource: null,
      },
      storage: {
        increase_per_level: 1000,
        resource: "science",
      },
      time: {
        base_seconds: 1500,
        percent_increase_per_level: 50,
        max_seconds: 86400,
      },
      energy_consumption: {
        base: 100,
        percent_increase_per_level: 25,
      },
    },
  },
};
