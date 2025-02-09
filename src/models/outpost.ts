import { DocumentSnapshot, Timestamp } from 'firebase-admin/firestore';

// outposts are NPC structures that can't be attacked by players. They serve for trading resources with players and for missions
export interface Outpost {
	id: string;
	name: string;
	position: {
		galaxy: number;
		x: number;
		y: number;
	};
	created_at: Timestamp;
	updated_at: Timestamp;
}

export function parseOutpost(doc: DocumentSnapshot): Outpost {
	const data = doc.data();
	if (!data) {
		throw new Error('Outpost not found');
	}

	return {
		id: doc.id || '',
		name: data.name || '',
		position: data.position || { galaxy: 0, x: 0, y: 0 },
		created_at: data.created_at || Timestamp.now(),
		updated_at: data.updated_at || Timestamp.now(),
	};
}
