export type TechnologyId =
  | "enhanced_mining"
  | "ansible_network"
  | "quantum_computing"
  | "espionage_tech";

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
  | "energy_efficiency"
  | "research_speed"
  | "construction_speed"
  | "research_sharing"
  | "resource_sharing";

export interface ResearchEffect {
  type: UnlockableType;
  target_id?: string; // ID of ship/structure/defense being unlocked
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

export const DEFAULT_RESEARCH_CONFIG: ResearchsConfig = {
  available_researchs: {
    enhanced_mining: {
      id: "enhanced_mining",
      category: "resource",
      max_level: 10,
      prerequisites: [],
      cost: {
        base_metal: 1000,
        base_deuterium: 400,
        base_science: 200,
        base_microchips: 100,
        percent_increase_per_level: 75,
      },
      time: {
        base_seconds: 1800,
        percent_increase_per_level: 50,
      },
      effects: [
        {
          type: "resource_boost",
          value: 5,
          per_level: true,
        },
      ],
    },

    ansible_network: {
      id: "ansible_network",
      category: "infrastructure",
      max_level: 1,
      prerequisites: [
        {
          technology_id: "quantum_computing",
          required_level: 5,
        },
      ],
      cost: {
        base_metal: 15000,
        base_deuterium: 10000,
        base_science: 5000,
        base_microchips: 100,
        percent_increase_per_level: 0,
      },
      time: {
        base_seconds: 86400,
        percent_increase_per_level: 0,
      },
      effects: [
        {
          type: "research_sharing",
          value: 1,
          per_level: false,
        },
      ],
    },

    quantum_computing: {
      id: "quantum_computing",
      category: "infrastructure",
      max_level: 10,
      prerequisites: [],
      cost: {
        base_metal: 15000,
        base_deuterium: 10000,
        base_science: 5000,
        base_microchips: 100,
        percent_increase_per_level: 50,
      },
      time: {
        base_seconds: 86400,
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
        base_metal: 5000,
        base_deuterium: 2000,
        base_science: 3000,
        base_microchips: 200,
        percent_increase_per_level: 0,
      },
      time: {
        base_seconds: 43200,
        percent_increase_per_level: 0,
      },
      effects: [
        {
          type: "ship",
          target_id: "spy_probe",
          value: 1,
          per_level: false,
        },
      ],
    },
  },
};
