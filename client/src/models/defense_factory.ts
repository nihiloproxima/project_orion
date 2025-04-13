import { Timestamp } from 'firebase/firestore';
import { Planet } from './planet';
import { DefenseType } from './game_config';

export interface DefenseFactoryQueueCommand {
	defense_type: DefenseType;
	count: number;
	construction_start_time: Timestamp;
	construction_finish_time: Timestamp;
}

export interface DefenseFactoryQueue {
	planet_id: Planet['id'];
	commands: Array<DefenseFactoryQueueCommand>;
	capacity: number;
	created_at: Timestamp;
	updated_at: Timestamp;
}
