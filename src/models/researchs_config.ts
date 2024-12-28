export type TechnologyId =
  | "enhanced_mining"
  | "ansible_network"
  | "quantum_computing"
  | "cryogenic_efficiency"
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
