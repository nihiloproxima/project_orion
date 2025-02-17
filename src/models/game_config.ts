import { Timestamp } from 'firebase/firestore';
import { PlanetBiome, ResourceType } from './planet';
import { ResearchConfig } from './researchs_config';
import { StructureConfig } from './structure_config';

export interface GameConfig {
	version: string;
	season: {
		current: number;
		next_start_at: Timestamp;
		end_at: Timestamp;
	};
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
	user_tasks: {
		refresh_interval_seconds: number;
	};
	structures: StructureConfig[];
	researchs: ResearchConfig[];
	biomes: {
		[key in PlanetBiome]: {
			[resource in ResourceType]?: number;
		};
	};
}
