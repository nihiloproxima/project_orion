import { ShipType } from "./game_config";
import { StructureType } from "./planet";

export type TechnologyId =
  | "colonization_tech" // Unlock colony ship
  | "combat_tech" // Unlock combat ship
  | "deuterium_production_boost" // Boost deuterium production
  | "energy_efficiency" // Boost energy production
  | "espionage_tech" // Unlock spy probe, upgrade to enhance espionage
  | "metal_production_boost" // Boost metal production
  | "microchips_production_boost" // Boost microchips production
  | "structures_construction_speed" // Boost construction speed
  | "transport_tech"; // Unlock transport ship

export type ResearchCategory = "resource" | "structure" | "ship";

export interface ResearchPrerequisite {
  technology_id: TechnologyId;
  required_level: number;
}

export type UnlockableType = "ship" | "structure" | "resource_boost";

export interface ResearchEffect {
  type: UnlockableType;
  target_type?: StructureType | ShipType; // Type of ship/structure/defense being unlocked
  resource_type?: "metal" | "deuterium" | "microchips" | "energy"; // Resource type for resource_boost
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
    base_microchips: number;
    percent_increase_per_level: number;
  };

  time: {
    base_seconds: number;
    percent_increase_per_level: number;
  };

  effects: ResearchEffect[];
}
