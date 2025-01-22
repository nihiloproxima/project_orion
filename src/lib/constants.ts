import { ResearchCategory, ShipType, StructureType } from '../models';
import { TechnologyId } from '../models';

export const SHIP_ASSETS: Record<ShipType, { name: string }> = {
	colony_ship: {
		name: 'Colony Ship',
	},
	transport_ship: {
		name: 'Transport Ship',
	},
	spy_probe: {
		name: 'Spy Probe',
	},
	recycler_ship: {
		name: 'Recycler Ship',
	},
	cruiser: {
		name: 'Cruiser',
	},
	destroyer: {
		name: 'Destroyer',
	},
};

export const STRUCTURE_INFO: Record<
	StructureType,
	{
		type: StructureType;
		name: string;
		description: string;
		productionType: string;
		hasStorage: boolean;
	}
> = {
	metal_mine: {
		type: 'metal_mine',
		name: 'Metal Mine',
		description: 'Mines and processes metal ore from planetary deposits. Each level increases metal production.',
		productionType: 'metal',
		hasStorage: false,
	},
	deuterium_synthesizer: {
		type: 'deuterium_synthesizer',
		name: 'Deuterium Synthesizer',
		description: 'Extracts hydrogen and synthesizes deuterium fuel. Each level increases deuterium production.',
		productionType: 'deuterium',
		hasStorage: false,
	},
	energy_plant: {
		type: 'energy_plant',
		name: 'Energy Plant',
		description: 'Generates power to fuel your planetary operations. Each level increases energy output.',
		productionType: 'energy',
		hasStorage: false,
	},
	research_lab: {
		type: 'research_lab',
		name: 'Research Laboratory',
		description: 'Conducts scientific research to unlock new technologies. Each level increases research speed.',
		productionType: 'none',
		hasStorage: false,
	},
	microchip_factory: {
		type: 'microchip_factory',
		name: 'Microchip Factory',
		description: 'Manufactures advanced microprocessors and circuitry. Each level increases microchip production.',
		productionType: 'microchips',
		hasStorage: false,
	},
	shipyard: {
		type: 'shipyard',
		name: 'Shipyard',
		description:
			'Builds and maintains your fleet of spacecraft. Each level unlocks new ship types and increases ship production speed.',
		productionType: 'none',
		hasStorage: false,
	},
	defense_factory: {
		type: 'defense_factory',
		name: 'Defense Factory',
		description:
			'Manufactures planetary defense systems and weaponry. Each level reduces defense construction time and unlocks new defense types.',
		productionType: 'none',
		hasStorage: false,
	},
	metal_hangar: {
		type: 'metal_hangar',
		name: 'Metal Hangar',
		description: 'Large-scale storage facility for processed metal. Each level increases metal storage capacity.',
		productionType: 'metal',
		hasStorage: true,
	},
	deuterium_tank: {
		type: 'deuterium_tank',
		name: 'Deuterium Tank',
		description:
			'Pressurized storage facility for deuterium fuel. Each level increases deuterium storage capacity.',
		productionType: 'deuterium',
		hasStorage: true,
	},
	microchip_vault: {
		type: 'microchip_vault',
		name: 'Microchip Vault',
		description:
			'Secure storage facility for sensitive microelectronics. Each level increases microchip storage capacity.',
		productionType: 'microchips',
		hasStorage: true,
	},
};

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
};
