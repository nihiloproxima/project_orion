import { DocumentSnapshot, Timestamp } from 'firebase-admin/firestore';
import { User } from './user';

export interface ChatMessage {
	id: string;
	type: 'user_message' | 'system_message';
	channel_id: string;
	sender: null | {
		id: User['id'] | null;
		name: User['name'];
		avatar: User['avatar'];
	};
	text: string;
	created_at: Timestamp;
}

export function parseChatMessage(doc: DocumentSnapshot): ChatMessage {
	const data = doc.data();
	if (!data) {
		throw new Error('Chat message not found');
	}

	return {
		id: doc.id,
		type: data.type,
		channel_id: data.channel_id,
		sender: data.sender,
		text: data.text,
		created_at: data.created_at,
	};
}
