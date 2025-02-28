import { DocumentSnapshot, Timestamp } from 'firebase/firestore';

export type ResourceType = 'metal' | 'microchips' | 'deuterium' | 'energy';
export type PlanetBiome = 'desert' | 'ocean' | 'jungle' | 'ice' | 'volcanic';
export type StructureType =
	| 'metal_mine'
	| 'energy_plant'
	| 'deuterium_synthesizer'
	| 'research_lab'
	| 'shipyard'
	| 'microchip_factory'
	| 'metal_hangar'
	| 'deuterium_tank'
	| 'microchip_vault';

export interface Structure {
	type: StructureType;
	level: number;
	production_rate: number; // from 0 to 100, adjust to consume less/more energy. Affects the production rate of the structure.
	construction_start_time: Timestamp | null;
	construction_finish_time: Timestamp | null;
	construction_levels: number | null;
}

export interface Planet {
	id: string;
	name: string;
	structures: Array<Structure>;
	resources: {
		metal: number;
		microchips: number;
		deuterium: number;
		energy: number;
		last_update: Timestamp;
	};
	position: {
		x: number;
		y: number;
		galaxy: number;
	};
	owner_id: string | null;
	is_homeworld: boolean;
	owner_name?: string;
	biome: PlanetBiome;
	size_km: number;
	created_at: Timestamp;
	updated_at: Timestamp;
	ttl: Timestamp;
}

export function parsePlanet(doc: DocumentSnapshot): Planet {
	const data = doc.data();
	if (!data) {
		throw new Error('Planet not found');
	}

	return {
		id: doc.id || '',
		name: data.name || '',
		structures: data.structures || [],
		resources: data.resources || {
			metal: 0,
			microchips: 0,
			deuterium: 0,
			energy: 0,
			last_update: Timestamp.now(),
		},
		position: data.position || {
			x: 0,
			y: 0,
			galaxy: 0,
		},
		owner_id: data.owner_id || null,
		is_homeworld: data.is_homeworld || false,
		owner_name: data.owner_name || '',
		biome: data.biome || 'temperate',
		size_km: data.size_km || 0,
		created_at: data.created_at || Timestamp.now(),
		updated_at: data.updated_at || Timestamp.now(),
		ttl: data.ttl || Timestamp.now(),
	};
}
