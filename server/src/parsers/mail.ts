import { Mail } from '../models';
import { DocumentSnapshot, Timestamp } from 'firebase-admin/firestore';

export function parseMail(doc: DocumentSnapshot): Mail {
	const data = doc.data();
	if (!data) {
		throw new Error('Mail not found');
	}

	return {
		id: doc.id || '',
		type: data.type || 'unknown',
		category: data.category || 'general',
		created_at: data.created_at || Timestamp.now(),
		sender_id: data.sender_id || '',
		sender_name: data.sender_name || '',
		title: data.title || '',
		content: data.content || '',
		read: data.read ?? false,
		archived: data.archived ?? false,
		data: data.data || {},
		ttl: data.ttl || Timestamp.now(),
	};
}
