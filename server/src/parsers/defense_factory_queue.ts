import { DocumentSnapshot, Timestamp } from 'firebase-admin/firestore';
import { DefenseFactoryQueue, Planet } from 'shared-types';

export function parseDefenseFactoryQueue(planetId: Planet['id'], doc: DocumentSnapshot): DefenseFactoryQueue {
	const data = doc.data();

	const defaultData: DefenseFactoryQueue = {
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
