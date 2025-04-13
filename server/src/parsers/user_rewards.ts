import { DocumentSnapshot } from 'firebase-admin/firestore';
import { UserReward } from '../models';

export function parseUserReward(doc: DocumentSnapshot): UserReward {
	const data = doc.data();
	if (!data) {
		throw new Error('User reward not found');
	}

	return {
		id: doc.id,
		data: data.data as UserReward['data'],
		created_at: data.created_at,
		updated_at: data.updated_at,
	};
}
