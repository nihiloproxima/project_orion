import { DebrisField } from 'shared-types';
import { DocumentSnapshot } from 'firebase-admin/firestore';

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
