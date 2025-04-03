import { DocumentSnapshot } from 'firebase-admin/firestore';
import { UserInventory } from 'shared-types';

export function parseUserInventory(doc: DocumentSnapshot): UserInventory {
	const data = doc.data();

	return {
		ship_blueprints: data?.ship_blueprints || [],
		ship_components: data?.ship_components || [],
		credits: data?.credits || 0,
	};
}
