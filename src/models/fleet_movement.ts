import { MissionType } from './ship';
import { ResourceType } from './planets_resources';

export type ResourcePayload = {
	[key in ResourceType]?: number;
};

export interface FleetMovement {
	id: string;
	owner_id: string;
	owner_name: string;
	ships_ids: string[];
	ship_counts: {
		[key: string]: number;
	};
	origin_planet_id: string;
	destination_planet_id: string;
	destination_name: string;
	origin_x: number;
	origin_y: number;
	destination_x: number;
	destination_y: number;
	mission_type: MissionType;
	departure_time: number;
	arrival_time: number;
	status: 'traveling' | 'returning';
	resources: ResourcePayload | null;
}
