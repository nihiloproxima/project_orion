import { DocumentSnapshot, Timestamp } from 'firebase-admin/firestore';
import { CrewMember } from './crew_member';
import { TechnologyId } from './researchs_config';

export type ShipType = 'colony' | 'transport' | 'spy' | 'recycler' | 'battle_ship';
export type ShipStatus = 'stationed' | 'traveling' | 'returning';
export type MissionType = 'transport' | 'colonize' | 'attack' | 'spy' | 'recycle' | 'delivery' | 'move';

export interface Ship {
	id: string;
	name: string;
	asset: number;
	stats: {
		speed: number;
		capacity: number;
		attack: number;
		defense: number;
		shield: number;
		evasion: number;
		accuracy: number;
	};
	components: Array<ShipComponent>;
	integrity: number; // 0 to 100. ship is unusable when integrity is 0
	crew: Array<CrewMember>;
	crew_capacity: number;
	owner_id: string;
	xp: number;
	level: number;
	created_by: {
		user_id: string;
		user_name: string;
	};
	created_at: Timestamp;
	updated_at: Timestamp;
}

export interface ShipBlueprint {
	id: string;
	ship_type: ShipType;
	name: string;
	description: string;
	base_stats: {
		speed: number;
		capacity: number;
		attack: number;
		defense: number;
		shield: number;
		evasion: number;
		crew_capacity: number;
	};
	required_components: {
		engine: number; // number of engine components required
		hull: number; // number of hull components required
		weapon: number; // number of weapon components required
		shield_generator: number; // number of shield generator components required
	};
	base_cost: {
		credits: number;
		resources: {
			metal?: number;
			crystal?: number;
			deuterium?: number;
		};
	};
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
export type ComponentEffect = 'rapid_fire' | 'stealth' | 'quick_maneuver' | 'precision';

export interface ShipComponent {
	type: ComponentType;
	name: string;
	rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
	effect: ComponentEffect | null;
	stats: {
		accuracy?: number;
		speed?: number;
		capacity?: number;
		attack?: number;
		defense?: number;
		shield?: number;
		evasion?: number;
		integrity?: number;
	};
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
		name: data.name || '',
		asset: data.asset || '',
		stats: data.stats || {},
		components: data.components || {},
		integrity: data.integrity || 0,
		crew: data.crew || 0,
		crew_capacity: data.crew_capacity || 0,
		owner_id: data.owner_id || '',
		xp: data.xp || 0,
		level: data.level || 1,
		created_by: data.created_by || '',
		created_at: data.created_at || Timestamp.now(),
		updated_at: data.updated_at || Timestamp.now(),
	};
}
