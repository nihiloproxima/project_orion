import { Planet } from 'shared-types';
import { DocumentSnapshot } from 'firebase-admin/firestore';

export function parsePlanet(doc: DocumentSnapshot): Planet {
	const data = doc.data();
	if (!data) {
		throw new Error('Planet not found');
	}

	return {
		id: doc.id || '',
		name: data.name || '',
		structures: data.structures || [],
		resources: data.resources || {
			metal: 0,
			microchips: 0,
			deuterium: 0,
			energy: 0,
			last_update: FirebaseFirestore.Timestamp.now(),
		},
		position: data.position || {
			x: 0,
			y: 0,
			galaxy: 0,
		},
		owner_id: data.owner_id || null,
		is_homeworld: data.is_homeworld || false,
		owner_name: data.owner_name || '',
		biome: data.biome || 'temperate',
		size_km: data.size_km || 0,
		created_at: data.created_at || FirebaseFirestore.Timestamp.now(),
		updated_at: data.updated_at || FirebaseFirestore.Timestamp.now(),
		ttl: data.ttl || FirebaseFirestore.Timestamp.now(),
	};
}
