import { DocumentSnapshot } from 'firebase-admin/firestore';
import { BaseReport } from 'shared-types';
export function parseReport(doc: DocumentSnapshot): BaseReport {
	const data = doc.data();
	if (!data) {
		throw new Error('Report not found');
	}

	return {
		id: doc.id,
		type: data.type,
		created_at: data.created_at,
		title: data.title,
		read: data.read,
	};
}
