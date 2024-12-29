import { ResourceType } from "./planets_resources";

export type StructureType =
  | "metal_mine"
  | "energy_plant"
  | "deuterium_synthesizer"
  | "research_lab"
  | "shipyard"
  | "defense_factory"
  | "microchip_factory"
  | "metal_hangar"
  | "deuterium_tank"
  | "microchip_vault"
  | "data_center";

export interface Structure {
  id: string;
  planet_id: string;
  type: StructureType;
  level: number;
  is_under_construction: boolean;
  production_rate: number;
  production_type: ResourceType | null;
  energy_consumption: number;
  construction_start_time: number | null;
  construction_finish_time: number | null;
}
