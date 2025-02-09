import { DocumentSnapshot, Timestamp } from 'firebase-admin/firestore';

export interface DebrisField {
	id: string;
	position: {
		galaxy: number;
		x: number;
		y: number;
	};
	resources: {
		metal: number;
		deuterium: number;
		microchips: number;
	};
	created_at: Timestamp;
	updated_at: Timestamp;
}

export function parseDebrisField(doc: DocumentSnapshot): DebrisField {
	const data = doc.data();
	if (!data) {
		throw new Error('Debris field not found');
	}

	return {
		id: doc.id,
		position: data.position,
		resources: data.resources,
		created_at: data.created_at,
		updated_at: data.updated_at,
	};
}
