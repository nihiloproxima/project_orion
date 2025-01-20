import { DefenseConfig } from './defense_config';
import { PlanetBiome } from './planet';
import { ResourceType } from './planets_resources';
import { ResearchConfig } from './researchs_config';
import { ShipConfig } from './ship_config';
import { StructureConfig } from './structure_config';

export interface GameConfig {
	planets: {
		count: number;
		grid_size: number;
		size_min: number;
		size_max: number;
		biome_distribution: {
			[key in PlanetBiome]: number;
		};
	};
	speed: {
		resources: number;
		researchs: number;
		ships: number;
		construction: number;
	};
	structures: StructureConfig[];
	researchs: ResearchConfig[];
	ships: ShipConfig[];
	defenses: DefenseConfig[];
	biomes: {
		[key in PlanetBiome]: {
			[resource in ResourceType]?: number;
		};
	};
}
