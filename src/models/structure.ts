import { ResourceType } from "./planets_resources";

export type StructureType =
  | "metal_mine"
  | "energy_plant"
  | "deuterium_synthesizer"
  | "research_lab"
  | "shipyard"
  | "defense_factory";

export interface Structure {
  id: string;
  planet_id: string;
  type: StructureType;
  level: number;
  is_under_construction: boolean;
  production_rate: number;
  production_type: ResourceType;
  construction_start_time: string | null;
  construction_finish_time: string | null;
}
