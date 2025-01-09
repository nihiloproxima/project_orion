import { ResearchCategory } from '../models';
import { TechnologyId } from '../models';

export const TECHNOLOGIES: Record<
	TechnologyId,
	{
		name: string;
		image: string;
		description: string;
		category: ResearchCategory;
		unlocks?: {
			ships?: string[];
			defense?: string[];
		};
	}
> = {
	transport_tech: {
		name: 'Transport Technology',
		image: 'transport_tech.png',
		description:
			'Advanced logistics and cargo management systems that enable the construction and operation of interstellar transport vessels.',
		category: 'ship',
		unlocks: {
			ships: ['Transport Ship'],
		},
	},
	colonization_tech: {
		name: 'Life Detection Systems',
		image: 'colonization_tech.png',
		description:
			'Advanced scanners and analysis tools for detecting habitable worlds. Unlocks colony ships and planetary settlement capabilities.',
		category: 'ship',
		unlocks: {
			ships: ['Colony Ship'],
		},
	},
	combat_tech: {
		name: 'Plasma Propulsion Systems',
		image: 'combat_tech.png',
		description:
			'Advanced propulsion technology utilizing superheated plasma to generate powerful thrust. Enables the construction of larger military vessels capable of interstellar combat.',
		category: 'ship',
		unlocks: {
			ships: ['Cruiser'],
		},
	},
	espionage_tech: {
		name: 'Espionage Technology',
		image: 'espionage_tech.png',
		description:
			'Increases your ability to gather intelligence on other players and their planets. Each level improves the accuracy and detail of espionage reports.',
		category: 'ship',
		unlocks: {
			ships: ['Spy Probe'],
		},
	},
	structures_construction_speed: {
		name: 'Nanite Constructors',
		image: 'nanite_constructors.png',
		description:
			'Microscopic robots assist in construction, increasing building speed with each level of research.',
		category: 'infrastructure',
	},
	deuterium_production_boost: {
		name: 'Cryogenic Efficiency',
		image: 'cryogenic_efficiency.png',
		description: 'Optimizes the cooling systems needed to store and transport deuterium, reducing losses.',
		category: 'resource',
	},
	energy_efficiency: {
		name: 'Energy Efficiency',
		image: 'energy_efficiency.png',
		description: 'Improves the energy production efficiency.',
		category: 'resource',
	},
	microchips_production_boost: {
		name: 'Advanced AI',
		image: 'advanced_ai.png',
		description: 'Advanced AI systems that automate experiments and analyze data patterns to accelerate research.',
		category: 'infrastructure',
	},
	metal_production_boost: {
		name: 'Enhanced Mining',
		image: 'enhanced_mining.png',
		description: 'Improves resource extraction efficiency.',
		category: 'resource',
	},
	science_production_boost: {
		name: 'Neural Network',
		image: 'neural_network.png',
		description:
			'Advanced neural networks that enhance computational processing and machine learning capabilities.',
		category: 'infrastructure',
	},
};
