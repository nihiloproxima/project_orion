import { Timestamp } from 'firebase/firestore';
// outposts are NPC structures that can't be attacked by players. They serve for trading resources with players and for missions
export interface Outpost {
	id: string;
	name: string;
	position: {
		galaxy: number;
		x: number;
		y: number;
	};
	created_at: Timestamp;
	updated_at: Timestamp;
}
