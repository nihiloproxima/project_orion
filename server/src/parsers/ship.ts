import { DocumentSnapshot } from 'firebase-admin/firestore';
import { Ship } from 'shared-types';

export function parseShip(doc: DocumentSnapshot): Ship {
	const data = doc.data();
	if (!data) {
		throw new Error('Ship not found');
	}

	return {
		id: data.id || '',
		rarity: data.rarity || 'common',
		type: data.type || '',
		name: data.name || '',
		asset: data.asset || '',
		stats: data.stats || {},
		components: data.components || {},
		integrity: data.integrity || 0,
		owner_id: data.owner_id || '',
		xp: data.xp || 0,
		position: data.position || null,
		level: data.level || 1,
		status: data.status || 'stationed',
		created_by: data.created_by || '',
		created_at: data.created_at || FirebaseFirestore.Timestamp.now(),
		updated_at: data.updated_at || FirebaseFirestore.Timestamp.now(),
	};
}
