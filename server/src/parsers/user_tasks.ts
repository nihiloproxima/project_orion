import { UserTasks } from '../models';
import { DocumentSnapshot, Timestamp } from 'firebase-admin/firestore';

export function parseUserTasks(doc: DocumentSnapshot): UserTasks {
	const data = doc.data();

	return {
		tasks: data?.tasks || [],
		next_refresh_at: data?.next_refresh_at || Timestamp.now(),
	};
}
