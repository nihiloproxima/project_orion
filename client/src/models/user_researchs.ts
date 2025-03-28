import { DocumentSnapshot, Timestamp } from 'firebase/firestore';
import { Planet } from './planet';

export interface Technology {
	level: number;
	is_researching: boolean;
	research_start_time: Timestamp | null;
	research_finish_time: Timestamp | null;
	researching_planet_id: Planet['id'] | null; // The planet where research is happening
	researching_planet_name: string | null; // The name of the planet where research is happening
}

export interface UserResearchs {
	technologies: {
		[technology_id: string]: Technology;
	};
	capacity: number; // amount of research labs
}

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
