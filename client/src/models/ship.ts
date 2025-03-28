import { DocumentSnapshot, Timestamp } from 'firebase/firestore';
import { TechnologyId } from './researchs_config';

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';
export type ShipType = 'colony' | 'transport' | 'spy' | 'recycler' | 'battle_ship';
export type ShipStatus = 'stationed' | 'traveling' | 'returning';
export type MissionType = 'transport' | 'colonize' | 'attack' | 'spy' | 'recycle' | 'delivery' | 'move' | 'expedition';
export type ShipStats = {
	speed: number;
	capacity: number;
	attack: number;
	defense: number;
	shield: number;
	evasion: number;
	accuracy: number;
	critical_chance: number;
	fire_rate: number;
	initiative: number;
};

export interface Ship {
	id: string;
	rarity: Rarity;
	type: ShipType;
	name: string;
	asset: number;
	stats: ShipStats;
	components: Array<ShipComponent>;
	integrity: number; // 0 to 100. ship is unusable when integrity is 0
	owner_id: string;
	xp: number;
	level: number;
	created_by: {
		user_id: string;
		user_name: string;
	};
	status: ShipStatus;
	created_at: Timestamp;
	updated_at: Timestamp;
}

export interface ShipBlueprint {
	id: string;
	rarity: Rarity;
	ship_type: ShipType;
	name: string;
	asset: number;
	description: string;
	base_stats: ShipStats;
	required_components: {
		engine: boolean; // boolean of engine components required
		hull: boolean; // boolean of hull components required
		weapon: boolean; // boolean of weapon components required
		shield_generator: boolean; // boolean of shield generator components required
	};
	base_cost: {
		credits: number;
		resources: {
			metal?: number;
			crystal?: number;
			deuterium?: number;
		};
	};
	construction_seconds: number;
	requirements: {
		shipyard_level: number;
		technologies: Array<{
			id: TechnologyId;
			level: number;
		}>;
	};
	level_requirement: number;
}

export type ComponentType = 'engine' | 'hull' | 'weapon' | 'shield_generator';
export type ComponentEffect =
	| 'rapid_fire' // Increase fire rate (%)
	| 'stealth' // Allow to avoid detection by enemy ships
	| 'lucky_find' // Increase loot rarity (%)
	| 'prospector' // find more resources on expeditions (%)
	| 'salvager' // find more components on expeditions (%)
	| 'harvester' // increase loot quantity (%)
	| 'deuterium_saver' // reduce deuterium requirements for expeditions (%)
	| 'backfire'; // attack ennemy when receiving a hit (bool)

export interface ShipComponent {
	id: string;
	type: ComponentType;
	name: string;
	rarity: Rarity;
	effect: ComponentEffect | null;
	stats: ShipStats;
	level_requirement: number;
	description: string;
}

export function parseShip(doc: DocumentSnapshot): Ship {
	const data = doc.data();
	if (!data) {
		throw new Error('Ship not found');
	}

	return {
		id: data.id || '',
		rarity: data.rarity || 'common',
		type: data.type || '',
		name: data.name || '',
		asset: data.asset || '',
		stats: data.stats || {},
		components: data.components || {},
		integrity: data.integrity || 0,
		owner_id: data.owner_id || '',
		xp: data.xp || 0,
		level: data.level || 1,
		status: data.status || 'stationed',
		created_by: data.created_by || '',
		created_at: data.created_at || Timestamp.now(),
		updated_at: data.updated_at || Timestamp.now(),
	};
}
