import { Timestamp } from 'firebase/firestore';

export interface DebrisField {
	id: string;
	position: {
		galaxy: number;
		x: number;
		y: number;
	};
	resources: {
		metal: number;
		deuterium: number;
		microchips: number;
	};
	created_at: Timestamp;
	updated_at: Timestamp;
}
