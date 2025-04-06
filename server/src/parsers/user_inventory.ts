import { DocumentSnapshot } from 'firebase-admin/firestore';
import { UserInventory } from 'shared-types';

export function parseUserInventory(doc: DocumentSnapshot): UserInventory {
	const data = doc.data();

	return {
		credits: data?.credits || 0,
	};
}
