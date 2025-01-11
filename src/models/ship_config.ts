import { TechnologyId } from './researchs_config';
import { ShipType } from './ship';

export interface ShipStats {
	speed: {
		min: number;
		max: number;
	};
	cargo_capacity: {
		min: number;
		max: number;
	};
	attack_power: {
		min: number;
		max: number;
	};
	defense: {
		min: number;
		max: number;
	};
}

export interface ShipConfig {
	type: ShipType;
	cost: {
		metal: number;
		deuterium: number;
		microchips: number;
	};
	stats: ShipStats;
	construction_time: number;
	requirements: {
		shipyard_level: number;
		technologies: Array<{
			id: TechnologyId;
			level: number;
		}>;
	};
}
