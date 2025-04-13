import { StructureType } from '.';
import { Timestamp } from 'firebase/firestore';
import { PlanetBiome, ResourceType } from './planet';
import { ResearchConfig, TechnologyId } from './researchs_config';
import { StructureConfig } from './structure_config';

export interface Requirement {
	type: 'structure' | 'technology';
	id: StructureType | TechnologyId;
	level: number;
}

export type ShipType =
	| 'colonizer'
	| 'transporter'
	| 'spy_probe'
	| 'recycler'
	| 'destroyer'
	| 'cruiser'
	| 'battleship'
	| 'interceptor'
	| 'death_star';

export type ShipConfig = {
	type: ShipType;
	construction: {
		metal: number;
		microchips: number;
		seconds: number;
	};
	requirements: Requirement[];
	speed: number;
	capacity: number;
	attack: number;
	defense: number;
	evasion: number;
	accuracy: number;
	critical_chance: number;
	fire_rate: number;
	initiative: number;
};

export type DefenseType = 'laser_cannon' | 'ion_cannon' | 'rocket_launcher' | 'missile_launcher' | 'shield_generator';

export type DefenseConfig = {
	type: DefenseType;
	construction: {
		metal: number;
		microchips: number;
		seconds: number;
	};
	attack: number;
	defense: number;
	accuracy: number;
	critical_chance: number;
};

export interface GameConfig {
	version: string;
	season: {
		current: number;
		next_start_at: Timestamp;
		end_at: Timestamp;
	};
	ships: Array<ShipConfig>;
	defenses: Array<DefenseConfig>;
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
