import { ShipType } from "./ship";
import { StructureType } from "./structure";

export type TechnologyId =
  | "colonization_tech" // Unlock colony ship
  | "combat_tech" // Unlock combat ship
  | "deuterium_production_boost" // Boost deuterium production
  | "energy_efficiency" // Boost energy production
  | "espionage_tech" // Unlock spy probe, upgrade to enhance espionage
  | "metal_production_boost" // Boost metal production
  | "microchips_production_boost" // Boost microchips production
  | "science_production_boost" // Boost science production through distributed
  | "structures_construction_speed" // Boost construction speed
  | "transport_tech"; // Unlock transport ship

export type ResearchCategory =
  | "resource"
  | "infrastructure"
  | "misc"
  | "ship"
  | "defense";

export interface ResearchPrerequisite {
  technology_id: TechnologyId;
  required_level: number;
}

export type UnlockableType =
  | "ship"
  | "structure"
  | "defense"
  | "resource_boost"
  | "research_speed"
  | "construction_speed"
  | "research_sharing"
  | "resource_sharing";

export interface ResearchEffect {
  type: UnlockableType;
  target_type?: StructureType | ShipType; // Type of ship/structure/defense being unlocked
  resource_type?: "metal" | "deuterium" | "microchips" | "science" | "energy"; // Resource type for resource_boost
  value: number;
  per_level: boolean;
}

export interface ResearchConfig {
  id: TechnologyId;
  category: ResearchCategory;
  max_level: number;
  prerequisites: ResearchPrerequisite[];

  cost: {
    base_metal: number;
    base_deuterium: number;
    base_science: number;
    base_microchips: number;
    percent_increase_per_level: number;
  };

  time: {
    base_seconds: number;
    percent_increase_per_level: number;
  };

  effects: ResearchEffect[];
}

export interface ResearchsConfig {
  available_researchs: {
    [technoId in TechnologyId]: ResearchConfig;
  };
}

export const DEFAULT_RESEARCHS_CONFIG: ResearchsConfig = {
  available_researchs: {
    transport_tech: {
      id: "transport_tech",
      category: "ship",
      max_level: 1,
      prerequisites: [],
      cost: {
        base_metal: 100,
        base_deuterium: 50,
        base_science: 40,
        base_microchips: 30,
        percent_increase_per_level: 0,
      },
      time: {
        base_seconds: 60,
        percent_increase_per_level: 0,
      },
      effects: [
        {
          type: "ship",
          target_type: "transport_ship",
          value: 1,
          per_level: false,
        },
      ],
    },
    colonization_tech: {
      id: "colonization_tech",
      category: "ship",
      max_level: 1,
      prerequisites: [],
      cost: {
        base_metal: 100,
        base_deuterium: 50,
        base_science: 40,
        base_microchips: 30,
        percent_increase_per_level: 0,
      },
      time: {
        base_seconds: 60,
        percent_increase_per_level: 0,
      },
      effects: [
        {
          type: "ship",
          target_type: "colony_ship",
          value: 1,
          per_level: false,
        },
      ],
    },
    combat_tech: {
      id: "combat_tech",
      category: "ship",
      max_level: 1,
      prerequisites: [],
      cost: {
        base_metal: 150,
        base_deuterium: 75,
        base_science: 60,
        base_microchips: 45,
        percent_increase_per_level: 0,
      },
      time: {
        base_seconds: 60,
        percent_increase_per_level: 0,
      },
      effects: [
        {
          type: "ship",
          target_type: "cruiser",
          value: 1,
          per_level: false,
        },
      ],
    },
    deuterium_production_boost: {
      id: "deuterium_production_boost",
      category: "resource",
      max_level: 10,
      prerequisites: [],
      cost: {
        base_metal: 100,
        base_deuterium: 40,
        base_science: 20,
        base_microchips: 10,
        percent_increase_per_level: 75,
      },
      time: {
        base_seconds: 30,
        percent_increase_per_level: 50,
      },
      effects: [
        {
          type: "resource_boost",
          target_type: "deuterium_synthesizer",
          resource_type: "deuterium",
          value: 5,
          per_level: true,
        },
      ],
    },
    metal_production_boost: {
      id: "metal_production_boost",
      category: "resource",
      max_level: 10,
      prerequisites: [],
      cost: {
        base_metal: 100,
        base_deuterium: 40,
        base_science: 20,
        base_microchips: 10,
        percent_increase_per_level: 75,
      },
      time: {
        base_seconds: 30,
        percent_increase_per_level: 50,
      },
      effects: [
        {
          type: "resource_boost",
          target_type: "metal_mine",
          resource_type: "metal",
          value: 5,
          per_level: true,
        },
      ],
    },
    energy_efficiency: {
      id: "energy_efficiency",
      category: "resource",
      max_level: 10,
      prerequisites: [],
      cost: {
        base_metal: 120,
        base_deuterium: 60,
        base_science: 30,
        base_microchips: 15,
        percent_increase_per_level: 75,
      },
      time: {
        base_seconds: 30,
        percent_increase_per_level: 50,
      },
      effects: [
        {
          type: "resource_boost",
          target_type: "energy_plant",
          resource_type: "energy",
          value: 5,
          per_level: true,
        },
      ],
    },
    science_production_boost: {
      id: "science_production_boost",
      category: "resource",
      max_level: 10,
      prerequisites: [
        {
          technology_id: "microchips_production_boost",
          required_level: 3,
        },
      ],
      cost: {
        base_metal: 100,
        base_deuterium: 80,
        base_science: 40,
        base_microchips: 50,
        percent_increase_per_level: 75,
      },
      time: {
        base_seconds: 30,
        percent_increase_per_level: 50,
      },
      effects: [
        {
          type: "resource_boost",
          target_type: "research_lab",
          resource_type: "science",
          value: 8,
          per_level: true,
        },
      ],
    },
    microchips_production_boost: {
      id: "microchips_production_boost",
      category: "infrastructure",
      max_level: 10,
      prerequisites: [],
      cost: {
        base_metal: 150,
        base_deuterium: 100,
        base_science: 50,
        base_microchips: 10,
        percent_increase_per_level: 50,
      },
      time: {
        base_seconds: 30,
        percent_increase_per_level: 50,
      },
      effects: [
        {
          type: "research_speed",
          value: 10,
          per_level: true,
        },
      ],
    },
    espionage_tech: {
      id: "espionage_tech",
      category: "ship",
      max_level: 1,
      prerequisites: [],
      cost: {
        base_metal: 50,
        base_deuterium: 20,
        base_science: 30,
        base_microchips: 20,
        percent_increase_per_level: 0,
      },
      time: {
        base_seconds: 30,
        percent_increase_per_level: 0,
      },
      effects: [
        {
          type: "ship",
          target_type: "spy_probe",
          value: 1,
          per_level: false,
        },
      ],
    },
    structures_construction_speed: {
      id: "structures_construction_speed",
      category: "infrastructure",
      max_level: 50,
      prerequisites: [],
      cost: {
        base_metal: 80,
        base_deuterium: 40,
        base_science: 30,
        base_microchips: 20,
        percent_increase_per_level: 50,
      },
      time: {
        base_seconds: 30,
        percent_increase_per_level: 50,
      },
      effects: [
        {
          type: "construction_speed",
          value: 10, // 10% faster construction per level
          per_level: true,
        },
      ],
    },
  },
};
