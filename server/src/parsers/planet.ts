import { Planet } from 'shared-types';
import { DocumentSnapshot, Timestamp } from 'firebase-admin/firestore';

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
			last_update: Timestamp.now(),
		},
		ships: {
			spy_probe: data.ships?.spy_probe || 0,
			colonizer: data.ships?.colonizer || 0,
			transporter: data.ships?.transporter || 0,
			recycler: data.ships?.recycler || 0,
			destroyer: data.ships?.destroyer || 0,
			cruiser: data.ships?.cruiser || 0,
			battleship: data.ships?.battleship || 0,
			interceptor: data.ships?.interceptor || 0,
			death_star: data.ships?.death_star || 0,
		},
		defenses: {
			rocket_launcher: data.defenses?.rocket_launcher || 0,
			missile_launcher: data.defenses?.missile_launcher || 0,
			ion_cannon: data.defenses?.ion_cannon || 0,
			laser_cannon: data.defenses?.laser_cannon || 0,
			shield_generator: data.defenses?.shield_generator || 0,
		},
		position: data.position || {
			x: 0,
			y: 0,
			chunk: 0,
		},
		owner_id: data.owner_id || null,
		is_homeworld: data.is_homeworld || false,
		owner_name: data.owner_name || '',
		biome: data.biome || 'temperate',
		radius: data.radius || 0,
		created_at: data.created_at || Timestamp.now(),
		updated_at: data.updated_at || Timestamp.now(),
		ttl: data.ttl || Timestamp.now(),
	};
}
