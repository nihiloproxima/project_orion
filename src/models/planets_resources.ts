export type ResourceType =
  | "metal"
  | "energy"
  | "deuterium"
  | "science"
  | "microchips";

export interface PlanetResources {
  planet_id: string;
  metal: number;
  microchips: number;
  deuterium: number;
  science: number;
  energy_production: number;
  energy_consumption: number;
  metal_production_rate: number;
  microchips_production_rate: number;
  deuterium_production_rate: number;
  science_production_rate: number;
  max_metal: number;
  max_microchips: number;
  max_deuterium: number;
  max_science: number;
  last_update: number;
}
