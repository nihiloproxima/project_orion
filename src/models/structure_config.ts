import { StructureType, ResourceType } from './planet';
import { TechnologyId } from './researchs_config';

export interface StructureConfig {
	type: StructureType;

	cost: Array<{
		metal_base: number;
		level: number;
		multiplier: number;
		reducer: number;
		offset: number;
		minus: number;
	}>;

	prerequisites: {
		structures: {
			type: StructureType;
			level: number;
		}[];
		technologies: {
			id: TechnologyId;
			level: number;
		}[];
	};

	production: {
		base: number | null;
		per_level: number | null;
		resource: ResourceType | null;
	};

	storage: {
		base: number | null;
		per_level: number | null;
		resource: ResourceType | null;
	};

	construction_time: {
		seconds: number;
	};

	energy_consumption: {
		base: number;
		per_level: number;
	};

	max_level: number | null;
}
