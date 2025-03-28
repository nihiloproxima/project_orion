import { DocumentSnapshot, Timestamp } from 'firebase/firestore';
import { Planet } from './planet';
import { Ship, ShipBlueprint } from './ship';

export interface ShipyardQueueCommand {
	ship: Partial<Ship>;
	construction_start_time: Timestamp;
	construction_finish_time: Timestamp;
	base_cost: ShipBlueprint['base_cost'];
}

export interface ShipyardQueue {
	planet_id: Planet['id'];
	commands: Array<ShipyardQueueCommand>;
	capacity: number;
	created_at: Timestamp;
	updated_at: Timestamp;
}

export function parseShipyardQueue(planetId: Planet['id'], doc: DocumentSnapshot): ShipyardQueue {
	const data = doc.data();

	const defaultData: ShipyardQueue = {
		planet_id: planetId,
		commands: [],
		capacity: 5,
		created_at: Timestamp.now(),
		updated_at: Timestamp.now(),
	};

	return {
		planet_id: data?.planet_id || defaultData.planet_id,
		commands: data?.commands || defaultData.commands,
		capacity: data?.capacity || defaultData.capacity,
		created_at: data?.created_at || defaultData.created_at,
		updated_at: data?.updated_at || defaultData.updated_at,
	};
}
