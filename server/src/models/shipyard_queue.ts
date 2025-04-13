import { Timestamp } from 'firebase-admin/firestore';
import { Planet } from './planet';
import { ShipType } from './game_config';

export interface ShipyardQueueCommand {
	ship_type: ShipType;
	count: number;
	current_item_start_time: Timestamp;
	current_item_finish_time: Timestamp;
	construction_start_time: Timestamp;
	construction_finish_time: Timestamp;
}

export interface ShipyardQueue {
	planet_id: Planet['id'];
	commands: Array<ShipyardQueueCommand>;
	capacity: number;
	created_at: Timestamp;
	updated_at: Timestamp;
}
