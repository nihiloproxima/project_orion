import { DocumentSnapshot } from 'firebase-admin/firestore';
import { UserInventory } from '../models';

export function parseUserInventory(doc: DocumentSnapshot): UserInventory {
	const data = doc.data();

	return {
		credits: data?.credits || 0,
	};
}
