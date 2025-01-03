import { ResourceType } from "./planets_resources";
import { StructureType } from "./structure";
import { TechnologyId } from "./researchs_config";

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

  prerequisites: {
    structures: {
      type: StructureType;
      level: number;
    }[];
    technologies: {
      id: TechnologyId;
      level: number;
    }[];
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
          metal: 400,
          deuterium: 0,
          microchips: 0,
          science: 0,
        },
        percent_increase_per_level: 10,
      },
      prerequisites: {
        structures: [],
        technologies: [],
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
        percent_increase_per_level: 75,
        max_seconds: 86400,
      },
      energy_consumption: {
        base: 10,
        percent_increase_per_level: 40,
      },
    },
    deuterium_synthesizer: {
      prerequisites: {
        structures: [
          {
            type: "metal_mine",
            level: 1,
          },
        ],
        technologies: [],
      },
      cost: {
        resources: {
          metal: 100,
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
    energy_plant: {
      prerequisites: {
        structures: [
          {
            type: "deuterium_synthesizer",
            level: 1,
          },
        ],
        technologies: [],
      },
      cost: {
        resources: {
          metal: 150,
          deuterium: 0,
          microchips: 0,
          science: 0,
        },
        percent_increase_per_level: 100,
      },
      production: {
        base: 100,
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
    research_lab: {
      prerequisites: {
        structures: [
          {
            type: "energy_plant",
            level: 1,
          },
        ],
        technologies: [],
      },
      cost: {
        resources: {
          metal: 200,
          deuterium: 100,
          microchips: 0,
          science: 0,
        },
        percent_increase_per_level: 80,
      },
      production: {
        base: 2,
        percent_increase_per_level: 50,
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
    microchip_factory: {
      cost: {
        resources: {
          metal: 300,
          deuterium: 0,
          microchips: 0,
          science: 25,
        },
        percent_increase_per_level: 50,
      },
      prerequisites: {
        structures: [
          {
            type: "research_lab",
            level: 1,
          },
        ],
        technologies: [],
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
    shipyard: {
      cost: {
        resources: {
          metal: 1000,
          deuterium: 200,
          microchips: 50,
          science: 50,
        },
        percent_increase_per_level: 60,
      },
      production: {
        base: null,
        percent_increase_per_level: null,
        resource: null,
      },
      prerequisites: {
        structures: [
          {
            type: "research_lab",
            level: 1,
          },
        ],
        technologies: [],
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
          metal: 2000,
          deuterium: 300,
          microchips: 150,
          science: 40,
        },
        percent_increase_per_level: 50,
      },
      prerequisites: {
        structures: [
          {
            type: "research_lab",
            level: 1,
          },
        ],
        technologies: [],
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
    metal_hangar: {
      cost: {
        resources: {
          metal: 3000,
          deuterium: 0,
          microchips: 0,
          science: 0,
        },
        percent_increase_per_level: 75,
      },
      prerequisites: {
        structures: [
          {
            type: "metal_mine",
            level: 5,
          },
        ],
        technologies: [],
      },
      production: {
        base: null,
        percent_increase_per_level: null,
        resource: null,
      },
      storage: {
        increase_per_level: 15000,
        resource: "metal",
      },
      time: {
        base_seconds: 60,
        percent_increase_per_level: 100,
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
      prerequisites: {
        structures: [
          {
            type: "deuterium_synthesizer",
            level: 5,
          },
        ],
        technologies: [],
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
        base_seconds: 60,
        percent_increase_per_level: 100,
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
      prerequisites: {
        structures: [
          {
            type: "microchip_factory",
            level: 5,
          },
        ],
        technologies: [],
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
      prerequisites: {
        structures: [
          {
            type: "research_lab",
            level: 3,
          },
        ],
        technologies: [],
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
