import { Timestamp } from 'firebase/firestore';
import { ShipBlueprint, ShipComponent } from './ship';
import { User } from './user';
import { ResourceType } from './planet';

// path: seasons/x/marketplace/components

export interface ComponentForSale {
	id: string;
	component: ShipComponent;
	agent: {
		id: User['id'];
	};
	price: number;
	created_at: Timestamp;
	updated_at: Timestamp;
}

// path: seasons/x/marketplace/blueprints
export interface BlueprintForSale {
	id: string;
	blueprint: ShipBlueprint;
	agent: {
		id: User['id'];
	};
	price: number;
	created_at: Timestamp;
	updated_at: Timestamp;
}

// path: seasons/x/marketplace/resources
export interface ResourceForSale {
	id: string;
	resource: ResourceType;
	amount: number;
	agent: {
		id: User['id'];
	};
	price: number;
	created_at: Timestamp;
	updated_at: Timestamp;
}
