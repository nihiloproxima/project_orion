import { DocumentSnapshot } from 'firebase-admin/firestore';

export type CrewMemberRole = 'captain' | 'doctor' | 'reparator' | 'artificer' | 'navigator' | 'chef';

export interface CrewMember {
	id: string;
	name: string;
	level: number;
	xp: number;
	role: CrewMemberRole;
	created_at: number;
	updated_at: number;
}

export function parseCrewMember(doc: DocumentSnapshot): CrewMember {
	const data = doc.data();
	if (!data) {
		throw new Error('Crew member not found');
	}

	return {
		id: doc.id,
		name: data.name,
		level: data.level,
		xp: data.xp,
		role: data.role,
		created_at: data.created_at,
		updated_at: data.updated_at,
	};
}
