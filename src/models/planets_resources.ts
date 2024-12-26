export type ResourceType = "metal" | "energy" | "deuterium" | "science";

export interface PlanetResources {
  planet_id: string;
  metal: number;
  metal_generation_rate: number;
  crystal: number;
  crystal_generation_rate: number;
  energy: number;
  energy_generation_rate: number;
  deuterium: number;
  deuterium_generation_rate: number;
  science: number;
  science_generation_rate: number;
  last_update: Date;
}
