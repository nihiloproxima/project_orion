export type PlanetBiome = "desert" | "ocean" | "jungle" | "ice" | "volcanic";

export interface Planet {
    id: string;
    name: string;
    coordinate_x: number;
    coordinate_y: number;
    owner_id: string | null;
    is_homeworld: boolean;
    biome: PlanetBiome;
    size_km: number;
    created_at: Date;
    updated_at: Date;
}
