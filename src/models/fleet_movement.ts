import { MissionType, Ship } from './ship';
import { Planet, ResourceType } from './planet';
import { DocumentSnapshot, Timestamp } from 'firebase/firestore';
import { User } from './user';

export type ResourcePayload = {
	[key in ResourceType]?: number;
};

export interface FleetMovement {
	id: string;
	owner_id: string;
	owner_name: string;
	ships: Array<Partial<Ship>>;
	ship_ids: string[];
	origin: {
		planet_id: Planet['id'];
		planet_name: Planet['name'];
		coordinates: {
			x: number;
			y: number;
			galaxy: number;
		};
	};
	destination: {
		planet_id: Planet['id'];
		planet_name: Planet['name'];
		user_id: User['id'] | null;
		anomaly_id?: string;
		coordinates: {
			x: number;
			y: number;
			galaxy: number;
		};
	};
	mission_type: MissionType;
	departure_time: Timestamp;
	arrival_time: Timestamp;
	expedition_end_time?: Timestamp;
	status: 'traveling' | 'returning' | 'expeditioning';
	resources: ResourcePayload | null;
}

export function parseFleetMovement(doc: DocumentSnapshot): FleetMovement {
	const data = doc.data();
	if (!data) {
		throw new Error('Fleet movement not found');
	}
	return {
		id: doc.id,
		owner_id: data.owner_id || '',
		owner_name: data.owner_name || '',
		ships: data.ships || [],
		ship_ids: data.ship_ids || [],
		origin: data.origin || { planet_id: '', coordinates: { x: 0, y: 0, galaxy: 0 } },
		destination: data.destination || { planet_id: '', coordinates: { x: 0, y: 0, galaxy: 0 } },
		mission_type: data.mission_type || 'unknown',
		departure_time: data.departure_time || Timestamp.now(),
		arrival_time: data.arrival_time || Timestamp.now(),
		expedition_end_time: data.expedition_end_time || undefined,
		status: data.status || 'traveling',
		resources: data.resources || null,
	};
}
