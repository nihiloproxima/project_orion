export type ResourceType = 'metal' | 'energy' | 'deuterium' | 'microchips';

export interface PlanetResources {
	planet_id: string;
	metal: number;
	microchips: number;
	deuterium: number;
	energy: number;
	updated_at: number;
	created_at: number;
}

export const DEFAULT_PLANET_RESOURCES: PlanetResources = {
	planet_id: '',
	metal: 500,
	microchips: 0,
	deuterium: 500,
	energy: 30,
	updated_at: Date.now(),
	created_at: Date.now(),
};
