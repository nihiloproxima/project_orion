import { Outpost } from '../models';
import { DocumentSnapshot, Timestamp } from 'firebase-admin/firestore';

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
