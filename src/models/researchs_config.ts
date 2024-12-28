import { ShipType } from "./ship";
import { StructureType } from "./structure";

export type TechnologyId =
  | "enhanced_mining" // Boost metal production
  | "cryogenic_efficiency" // Boost deuterium production
  | "energy_efficiency" // Boost energy production
  | "quantum_computing" // Boost microchips production
  | "neural_network" // Boost science production through distributed
  | "ansible_network" // All researchs are shared across your planets
  | "espionage_tech" // Unlock spy probe, upgrade to enhance espionage
  | "nanite_constructors"; // More sci-fi name

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
