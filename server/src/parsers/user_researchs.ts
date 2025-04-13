import { DocumentSnapshot } from 'firebase-admin/firestore';
import { UserResearchs } from '../models';

export function parseUserResearchs(doc: DocumentSnapshot): UserResearchs {
	const data = doc.data();
	if (!data) {
		throw new Error('User researchs not found');
	}

	return {
		technologies: data.technologies || {},
		capacity: data.capacity || 0,
	};
}
