import { UserTasks } from 'shared-types';
import { DocumentSnapshot } from 'firebase-admin/firestore';

export function parseUserTasks(doc: DocumentSnapshot): UserTasks {
	const data = doc.data();

	return {
		tasks: data?.tasks || [],
		next_refresh_at: data?.next_refresh_at || FirebaseFirestore.Timestamp.now(),
	};
}
