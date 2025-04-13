import { DocumentSnapshot, Timestamp } from 'firebase-admin/firestore';
import { ShipyardQueue, Planet } from '../models';

export function parseShipyardQueue(planetId: Planet['id'], doc: DocumentSnapshot): ShipyardQueue {
	const data = doc.data();

	const defaultData: ShipyardQueue = {
		planet_id: planetId,
		commands: [],
		capacity: 1,
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
