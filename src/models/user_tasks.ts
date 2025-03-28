import { DocumentSnapshot, Timestamp } from 'firebase/firestore';
import {
	CreditsReward,
	DebrisField,
	MissionType,
	Outpost,
	Planet,
	ResourcesReward,
	ResourceType,
	ShipType,
	StructureType,
	TechnologyId,
	XpReward,
} from '.';

export type TaskId = string;
export type TaskType = 'ship' | 'mission' | 'research' | 'structure_construction' | 'delivery';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

export interface Task {
	id: TaskId;
	type: TaskType;
	context: string;
	status: TaskStatus;
	rewards: Array<ResourcesReward | CreditsReward | XpReward>;
}

export interface BuildStructureTask extends Task {
	id: string;
	type: 'structure_construction';
	structure_type: StructureType;
	required_level: number;
}

export interface ResearchTask extends Task {
	id: string;
	type: 'research';
	technology_id: TechnologyId;
	required_level: number;
}

export interface MissionTask extends Task {
	id: string;
	type: 'mission';
	mission_type: MissionType;
	target_type: 'planet' | 'debris_field' | 'anomaly' | 'outpost';
	target_id: Planet['id'] | DebrisField['id'] | Outpost['id']; // Anomaly id / outpost id
}

export interface ShipTask extends Task {
	id: string;
	type: 'ship';
	ship_type: ShipType;
	goal: number;
	progress: number;
}

export interface DeliveryTask extends Task {
	id: string;
	type: 'delivery';
	resource_type: ResourceType;
	goal: number;
	progress: number;
	outpost_id: Outpost['id'];
}

export interface UserTasks {
	tasks: Array<Task>;
	next_refresh_at: number;
}

export function parseUserTasks(doc: DocumentSnapshot): UserTasks {
	const data = doc.data();

	return {
		tasks: data?.tasks || [],
		next_refresh_at: data?.next_refresh_at || Timestamp.now(),
	};
}
