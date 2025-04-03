import { Timestamp } from "./timestamp";
export type ResourceType = "metal" | "microchips" | "deuterium" | "energy";
export type PlanetBiome = "desert" | "ocean" | "jungle" | "ice" | "volcanic";
export type StructureType =
  | "metal_mine"
  | "energy_plant"
  | "deuterium_synthesizer"
  | "research_lab"
  | "shipyard"
  | "microchip_factory"
  | "metal_hangar"
  | "deuterium_tank"
  | "microchip_vault";

export interface Structure {
  type: StructureType;
  level: number;
  production_rate: number; // from 0 to 100, adjust to consume less/more energy. Affects the production rate of the structure.
  construction_start_time: Timestamp | null;
  construction_finish_time: Timestamp | null;
  construction_levels: number | null;
}

export interface Planet {
  id: string;
  name: string;
  structures: Array<Structure>;
  resources: {
    metal: number;
    microchips: number;
    deuterium: number;
    energy: number;
    last_update: Timestamp;
  };
  position: {
    x: number;
    y: number;
    galaxy: number;
  };
  owner_id: string | null;
  is_homeworld: boolean;
  owner_name?: string;
  biome: PlanetBiome;
  size_km: number;
  created_at: Timestamp;
  updated_at: Timestamp;
  ttl: Timestamp;
}
