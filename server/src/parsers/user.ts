import { User } from 'shared-types';
import { DocumentSnapshot } from 'firebase-admin/firestore';

export function parseUser(doc: DocumentSnapshot): User {
	const data = doc.data();
	if (!data) {
		throw new Error('User not found');
	}
	return {
		id: doc.id,
		season: data.season,
		name: data.name,
		onboarding_step: data.onboarding_step,
		home_planet_id: data.home_planet_id,
		avatar: data.avatar,
		score: data.score,
		level: data.level,
		xp: data.xp,
		title: data.title,
		created_at: data.created_at,
		updated_at: data.updated_at,
	};
}
