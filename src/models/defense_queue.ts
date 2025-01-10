import { DefenseType } from './defense';

export interface DefenseQueueCommand {
	type: DefenseType;
	remaining_amount: number;
	total_amount: number;
	construction_start_time: number;
	construction_finish_time: number;
	current_item_start_time: number;
	current_item_finish_time: number;
	total_metal_cost: number;
	total_deuterium_cost: number;
	total_microchips_cost: number;
	total_science_cost: number;
}

export interface DefenseQueue {
	planet_id: string;
	commands: DefenseQueueCommand[];
	capacity: number;
	is_processing_command: boolean;
	updated_at: number;
	created_at: number;
}
