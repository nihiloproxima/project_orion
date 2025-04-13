import { User } from './user';
import { Timestamp } from 'firebase/firestore';

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
