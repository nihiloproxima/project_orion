import { ResearchCategory, ShipType, StructureType } from 'shared-types';
import { TechnologyId } from 'shared-types';

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

export const SHIP_CATEGORIES: Record<string, { nameKey: string; descriptionKey: string; types: ShipType[] }> = {
	civilian: {
		nameKey: 'categories.civilian.name',
		descriptionKey: 'categories.civilian.description',
		types: ['colonizer', 'transporter'] as ShipType[],
	},
	military: {
		nameKey: 'categories.military.name',
		descriptionKey: 'categories.military.description',
		types: ['cruiser', 'destroyer', 'battleship', 'interceptor', 'death_star'] as ShipType[],
	},
	special: {
		nameKey: 'categories.special.name',
		descriptionKey: 'categories.special.description',
		types: ['spy_probe', 'recycler_ship'] as ShipType[],
	},
};

export const SHIP_ASSETS: Record<ShipType, { nameKey: string; image: string; descriptionKey: string }> = {
	colonizer: {
		nameKey: 'ships.colonizer.name',
		image: `images/ships/colonizer.webp`,
		descriptionKey: 'ships.colonizer.description',
	},
	transporter: {
		nameKey: 'ships.transporter.name',
		image: `images/ships/transporter.webp`,
		descriptionKey: 'ships.transporter.description',
	},
	spy_probe: {
		nameKey: 'ships.spy_probe.name',
		image: `images/ships/spy_probe.webp`,
		descriptionKey: 'ships.spy_probe.description',
	},
	recycler: {
		nameKey: 'ships.recycler.name',
		image: `images/ships/recycler.webp`,
		descriptionKey: 'ships.recycler.description',
	},
	cruiser: {
		nameKey: 'ships.cruiser.name',
		image: `images/ships/cruiser.webp`,
		descriptionKey: 'ships.cruiser.description',
	},
	destroyer: {
		nameKey: 'ships.destroyer.name',
		image: `images/ships/destroyer.webp`,
		descriptionKey: 'ships.destroyer.description',
	},
	battleship: {
		nameKey: 'ships.battleship.name',
		image: `images/ships/battleship.webp`,
		descriptionKey: 'ships.battleship.description',
	},
	interceptor: {
		nameKey: 'ships.interceptor.name',
		image: `images/ships/interceptor.webp`,
		descriptionKey: 'ships.interceptor.description',
	},
	death_star: {
		nameKey: 'ships.death_star.name',
		image: `images/ships/death_star.webp`,
		descriptionKey: 'ships.death_star.description',
	},
};
