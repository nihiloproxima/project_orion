import { PlanetBiome } from "./planet";
import { StructuresConfig } from "./structures_config";

export type GameConfigData = StructuresConfig;

export interface PlanetsConfig {
    planet_count: number;
    planet_grid_size: number;
    planet_size_min: number;
    planet_size_max: number;
    planet_biome_distribution: {
        [key in PlanetBiome]: number;
    };
}

export type GameConfig = {
    id: string;
    version: string;
    config_data: GameConfigData;
    created_at: Date;
};
