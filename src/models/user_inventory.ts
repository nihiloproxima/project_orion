import { DocumentSnapshot } from 'firebase-admin/firestore';
import { ShipBlueprint, ShipComponent } from './ship';

export interface UserInventory {
	ship_blueprints: Array<ShipBlueprint>;
	ship_components: Array<ShipComponent>;
	credits: number;
}

export function parseUserInventory(doc: DocumentSnapshot): UserInventory {
	const data = doc.data();

	return {
		ship_blueprints: data?.ship_blueprints || [],
		ship_components: data?.ship_components || [],
		credits: data?.credits || 0,
	};
}
