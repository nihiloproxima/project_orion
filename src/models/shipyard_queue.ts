import { DocumentSnapshot, Timestamp } from 'firebase-admin/firestore';
import { Planet } from './planet';
import { Ship } from './ship';

export interface ShipyardQueueCommand {
	ship: Partial<Ship>;
	construction_start_time: Timestamp;
	construction_finish_time: Timestamp;
	current_item_start_time: Timestamp;
	current_item_finish_time: Timestamp;
	resources_cost: {
		metal: number;
		deuterium: number;
		microchips: number;
	};
}

export interface ShipyardQueue {
	planet_id: Planet['id'];
	commands: Array<ShipyardQueueCommand>;
	capacity: number;
	created_at: Timestamp;
	updated_at: Timestamp;
}

export function parseShipyardQueue(doc: DocumentSnapshot): ShipyardQueue {
	const data = doc.data();
	if (!data) {
		throw new Error('Shipyard queue not found');
	}

	return {
		planet_id: data.planet_id || '',
		commands: data.commands || [],
		capacity: data.capacity || 0,
		created_at: data.created_at || Timestamp.now(),
		updated_at: data.updated_at || Timestamp.now(),
	};
}
