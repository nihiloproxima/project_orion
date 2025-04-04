import { DocumentSnapshot, Timestamp } from 'firebase/firestore';
import { Planet, ResourceType } from './planet';
import { ShipBlueprint, ShipComponent } from './ship';

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
	blueprint?: ShipBlueprint;
	component?: ShipComponent;
}

export function parseUserReward(doc: DocumentSnapshot): UserReward {
	const data = doc.data();
	if (!data) {
		throw new Error('User reward not found');
	}

	return {
		id: doc.id,
		data: data.data as UserReward['data'],
		created_at: data.created_at,
		updated_at: data.updated_at,
	};
}
