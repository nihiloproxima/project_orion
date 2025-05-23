import { Timestamp } from 'firebase/firestore';
import { Planet, ResourceType } from './planet';

export interface UserReward {
	id: string;
	data: ResourcesReward | CreditsReward | XpReward | ExpeditionReward;
	created_at: Timestamp;
	updated_at: Timestamp;
}

export interface ResourcesReward {
	type: 'resources';
	planet_id: Planet['id'];
	resources: {
		[K in ResourceType]?: number;
	};
}

export interface CreditsReward {
	type: 'credits';
	credits: number;
}

export interface XpReward {
	type: 'xp';
	xp: number;
}

export interface ExpeditionReward {
	type: 'expedition';
	resources: {
		[K in ResourceType]?: number;
	};
	credits?: number;
	xp?: number;
}
