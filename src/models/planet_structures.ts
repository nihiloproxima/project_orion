export type StructureType =
	| 'metal_mine'
	| 'energy_plant'
	| 'deuterium_synthesizer'
	| 'research_lab'
	| 'shipyard'
	| 'defense_factory'
	| 'microchip_factory'
	| 'metal_hangar'
	| 'deuterium_tank'
	| 'microchip_vault'
	| 'data_center';

export interface Structure {
	type: StructureType;
	level: number;
	is_under_construction: boolean;
	production_rate: number; // from 0 to 100, adjust to consume less/more energy. Affects the production rate of the structure.
	construction_start_time: number | null;
	construction_finish_time: number | null;
}

export interface PlanetStructures {
	planet_id: string;
	structures: Structure[];
	updated_at: number;
}

export const DEFAULT_PLANET_STRUCTURES: PlanetStructures = {
	planet_id: '',
	structures: [
		{
			type: 'metal_mine',
			level: 1,
			is_under_construction: false,
			production_rate: 100,
			construction_start_time: null,
			construction_finish_time: null,
		},
		{
			type: 'energy_plant',
			level: 0,
			is_under_construction: false,
			production_rate: 100,
			construction_start_time: null,
			construction_finish_time: null,
		},
		{
			type: 'deuterium_synthesizer',
			level: 0,
			is_under_construction: false,
			production_rate: 100,
			construction_start_time: null,
			construction_finish_time: null,
		},
		{
			type: 'microchip_factory',
			level: 0,
			is_under_construction: false,
			production_rate: 100,
			construction_start_time: null,
			construction_finish_time: null,
		},
		{
			type: 'research_lab',
			level: 0,
			is_under_construction: false,
			production_rate: 100,
			construction_start_time: null,
			construction_finish_time: null,
		},
		{
			type: 'shipyard',
			level: 0,
			is_under_construction: false,
			production_rate: 100,
			construction_start_time: null,
			construction_finish_time: null,
		},
		{
			type: 'defense_factory',
			level: 0,
			is_under_construction: false,
			production_rate: 100,
			construction_start_time: null,
			construction_finish_time: null,
		},
		{
			type: 'metal_hangar',
			level: 0,
			is_under_construction: false,
			production_rate: 100,
			construction_start_time: null,
			construction_finish_time: null,
		},
		{
			type: 'deuterium_tank',
			level: 0,
			is_under_construction: false,
			production_rate: 100,
			construction_start_time: null,
			construction_finish_time: null,
		},
		{
			type: 'microchip_vault',
			level: 0,
			is_under_construction: false,
			production_rate: 100,
			construction_start_time: null,
			construction_finish_time: null,
		},
		{
			type: 'data_center',
			level: 0,
			is_under_construction: false,
			production_rate: 100,
			construction_start_time: null,
			construction_finish_time: null,
		},
	],
	updated_at: Date.now(),
};
