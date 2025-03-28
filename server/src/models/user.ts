import { DocumentSnapshot, Timestamp } from 'firebase-admin/firestore';
import { Planet } from './planet';

export type UserTitle = string;

export type OnboardingStep = 'create_user' | 'choose_homeworld' | 'build_metal_mine';

export interface User {
	id: string;
	season: number;
	name: string;
	onboarding_step: OnboardingStep;
	home_planet_id: Planet['id'] | null;
	avatar: number;
	score: number;
	level: number;
	xp: number;
	title: UserTitle | null;
	created_at: Timestamp;
	updated_at: Timestamp;
}

export function parseUser(doc: DocumentSnapshot): User {
	const data = doc.data();
	if (!data) {
		throw new Error('User not found');
	}
	return {
		id: doc.id,
		season: data.season,
		name: data.name,
		onboarding_step: data.onboarding_step,
		home_planet_id: data.home_planet_id,
		avatar: data.avatar,
		score: data.score,
		level: data.level,
		xp: data.xp,
		title: data.title,
		created_at: data.created_at,
		updated_at: data.updated_at,
	};
}
