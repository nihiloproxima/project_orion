import { ResearchCategory, StructureType } from '../models';
import { TechnologyId } from '../models';

export const STRUCTURE_INFO: Record<
	StructureType,
	{
		type: StructureType;
		nameKey: string;
		descriptionKey: string;
		productionType: string;
		hasStorage: boolean;
	}
> = {
	metal_mine: {
		type: 'metal_mine',
		nameKey: 'metal_mine.name',
		descriptionKey: 'metal_mine.description',
		productionType: 'metal',
		hasStorage: false,
	},
	deuterium_synthesizer: {
		type: 'deuterium_synthesizer',
		nameKey: 'deuterium_synthesizer.name',
		descriptionKey: 'deuterium_synthesizer.description',
		productionType: 'deuterium',
		hasStorage: false,
	},
	energy_plant: {
		type: 'energy_plant',
		nameKey: 'energy_plant.name',
		descriptionKey: 'energy_plant.description',
		productionType: 'energy',
		hasStorage: false,
	},
	research_lab: {
		type: 'research_lab',
		nameKey: 'research_lab.name',
		descriptionKey: 'research_lab.description',
		productionType: 'none',
		hasStorage: false,
	},
	microchip_factory: {
		type: 'microchip_factory',
		nameKey: 'microchip_factory.name',
		descriptionKey: 'microchip_factory.description',
		productionType: 'microchips',
		hasStorage: false,
	},
	shipyard: {
		type: 'shipyard',
		nameKey: 'shipyard.name',
		descriptionKey: 'shipyard.description',
		productionType: 'none',
		hasStorage: false,
	},
	metal_hangar: {
		type: 'metal_hangar',
		nameKey: 'metal_hangar.name',
		descriptionKey: 'metal_hangar.description',
		productionType: 'metal',
		hasStorage: true,
	},
	deuterium_tank: {
		type: 'deuterium_tank',
		nameKey: 'deuterium_tank.name',
		descriptionKey: 'deuterium_tank.description',
		productionType: 'deuterium',
		hasStorage: true,
	},
	microchip_vault: {
		type: 'microchip_vault',
		nameKey: 'microchip_vault.name',
		descriptionKey: 'microchip_vault.description',
		productionType: 'microchips',
		hasStorage: true,
	},
};

export const TECHNOLOGIES: Record<
	TechnologyId,
	{
		nameKey: string;
		image: string;
		descriptionKey: string;
		category: ResearchCategory;
		unlocks?: {
			ships?: string[];
			defense?: string[];
		};
	}
> = {
	transport_tech: {
		nameKey: 'transport_tech.name',
		image: 'transport_tech.png',
		descriptionKey: 'transport_tech.description',
		category: 'ship',
		unlocks: {
			ships: ['Transport Ship'],
		},
	},
	colonization_tech: {
		nameKey: 'colonization_tech.name',
		image: 'colonization_tech.png',
		descriptionKey: 'colonization_tech.description',
		category: 'ship',
		unlocks: {
			ships: ['Colony Ship'],
		},
	},
	combat_tech: {
		nameKey: 'combat_tech.name',
		image: 'combat_tech.png',
		descriptionKey: 'combat_tech.description',
		category: 'ship',
		unlocks: {
			ships: ['Cruiser'],
		},
	},
	espionage_tech: {
		nameKey: 'espionage_tech.name',
		image: 'espionage_tech.png',
		descriptionKey: 'espionage_tech.description',
		category: 'ship',
		unlocks: {
			ships: ['Spy Probe'],
		},
	},
	structures_construction_speed: {
		nameKey: 'structures_construction_speed.name',
		image: 'nanite_constructors.png',
		descriptionKey: 'structures_construction_speed.description',
		category: 'structure',
	},
	deuterium_production_boost: {
		nameKey: 'deuterium_production_boost.name',
		image: 'cryogenic_efficiency.png',
		descriptionKey: 'deuterium_production_boost.description',
		category: 'resource',
	},
	energy_efficiency: {
		nameKey: 'energy_efficiency.name',
		image: 'energy_efficiency.png',
		descriptionKey: 'energy_efficiency.description',
		category: 'resource',
	},
	microchips_production_boost: {
		nameKey: 'microchips_production_boost.name',
		image: 'advanced_ai.png',
		descriptionKey: 'microchips_production_boost.description',
		category: 'structure',
	},
	metal_production_boost: {
		nameKey: 'metal_production_boost.name',
		image: 'enhanced_mining.png',
		descriptionKey: 'metal_production_boost.description',
		category: 'resource',
	},
};
