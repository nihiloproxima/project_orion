export type PlanetBiome = "desert" | "ocean" | "jungle" | "ice" | "volcanic";

export interface Planet {
  id: string;
  name: string;
  coordinate_x: number;
  coordinate_y: number;
  coordinate_z: number;
  owner_id: string | null;
  owner_name?: string;
  is_homeworld: boolean;
  biome: PlanetBiome;
  size_km: number;
  created_at: number;
  updated_at: number;
}
