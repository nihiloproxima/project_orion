import { ChatMessage } from 'shared-types';
import { DocumentSnapshot } from 'firebase-admin/firestore';

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
