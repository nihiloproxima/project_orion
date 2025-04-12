import { DocumentSnapshot, Timestamp } from 'firebase-admin/firestore';
import { FleetMovement } from 'shared-types';

export function parseFleetMovement(doc: DocumentSnapshot): FleetMovement {
	const data = doc.data();
	if (!data) {
		throw new Error('Fleet movement not found');
	}
	return {
		id: doc.id,
		owner_id: data.owner_id || '',
		owner_name: data.owner_name || '',
		ships: data.ship || [],
		origin: data.origin || {
			planet_id: '',
			coordinates: { x: 0, y: 0, chunk: 0 },
		},
		destination: data.destination || {
			planet_id: '',
			coordinates: { x: 0, y: 0, chunk: 0 },
		},
		mission_type: data.mission_type || 'unknown',
		departure_time: data.departure_time || Timestamp.now(),
		arrival_time: data.arrival_time || Timestamp.now(),
		expedition_end_time: data.expedition_end_time || undefined,
		status: data.status || 'traveling',
		resources: data.resources || null,
	};
}
