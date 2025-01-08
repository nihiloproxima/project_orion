import { StructureType } from '@/models/planet_structures';
import { GameConfig } from '@/models/game_config';
import { ResourceType } from '@/models/planets_resources';
import { UserResearchs } from '@/models/user_researchs';
import { getTechnologyBonus } from './researchs_calculations';

interface HourlyProductionResult {
	resource: ResourceType | null;
	amount: number;
	energyConsumption: number;
}

export type StorageCapacities = {
	[key in ResourceType]: number;
};

export function calculateStructureHourlyProduction(
	gameConfig: GameConfig,
	structureType: StructureType,
	level: number
): HourlyProductionResult {
	const structure = gameConfig.structures.find((s) => s.type === structureType);

	if (!structure) {
		return {
			resource: null,
			amount: 0,
			energyConsumption: 0,
		};
	}

	// Calculate base production per hour
	let hourlyProduction = 0;
	if (structure.production.base !== null && structure.production.percent_increase_per_level !== null) {
		hourlyProduction =
			structure.production.base * (1 + (structure.production.percent_increase_per_level * level) / 100) * 3600; // Convert per-second to per-hour
	}

	// Calculate energy consumption
	const energyConsumption =
		structure.energy_consumption.base *
		(1 + (structure.energy_consumption.percent_increase_per_level * level) / 100);

	return {
		resource: structure.production.resource,
		amount: Math.floor(hourlyProduction),
		energyConsumption: energyConsumption,
	};
}

export function calculateStructureStorageCapacities(
	gameConfig: GameConfig,
	structureType: StructureType,
	level: number = 0
): StorageCapacities {
	const structure = gameConfig.structures.find((s) => s.type === structureType);
	if (!structure) {
		return { metal: 0, microchips: 0, deuterium: 0, science: 0, energy: 0 };
	}

	// Default storage values
	const capacities: StorageCapacities = {
		metal: 0,
		microchips: 0,
		deuterium: 0,
		science: 0,
		energy: 0,
	};

	// Calculate storage capacity if it's a storage structure
	if (structure.type.includes('storage')) {
		if (structure.storage.resource && structure.storage.increase_per_level) {
			capacities[structure.storage.resource] = structure.storage.increase_per_level * level;
		}
	}

	return capacities;
}

export function calculateUpgradeCost(
	config: GameConfig,
	structureType: StructureType,
	currentLevel: number
): {
	metal: number;
	deuterium: number;
	microchips: number;
	science: number;
} {
	const structureConfig = config.structures.find((s) => s.type === structureType);

	if (!structureConfig) {
		throw new Error(`Structure ${structureType} does not exist`);
	}
	const levelScaling = 1 + (structureConfig.cost.percent_increase_per_level * currentLevel) / 100;

	const result = {
		metal: structureConfig.cost.resources.metal * levelScaling,
		deuterium: structureConfig.cost.resources.deuterium * levelScaling,
		microchips: structureConfig.cost.resources.microchips * levelScaling,
		science: structureConfig.cost.resources.science * levelScaling,
	};

	return result;
}

export function calculateConstructionTime(
	config: GameConfig,
	userResearchs: UserResearchs,
	structureType: StructureType,
	currentLevel: number
) {
	const structureConfig = config.structures.find((s) => s.type === structureType);

	if (!structureConfig) {
		throw new Error(`Structure ${structureType} does not exist`);
	}

	const constructionSpeedCoef = getTechnologyBonus(config, userResearchs, 'construction_speed');

	// Base construction time in milliseconds
	const baseTimeMs = structureConfig.time.base_seconds * 1000;

	// Scale time with level based on config percentage increase
	const levelScaling = 1 + (structureConfig.time.percent_increase_per_level * currentLevel) / 100;

	// Apply construction speed bonus (lower is faster)
	let finalTimeMs = baseTimeMs * levelScaling * constructionSpeedCoef;

	// Cap at max time if configured
	if (structureConfig.time.max_seconds) {
		finalTimeMs = Math.min(finalTimeMs, structureConfig.time.max_seconds * 1000);
	}

	return Math.round(finalTimeMs);
}

export function calculateStructureEnergyConsumption(
	gameConfig: GameConfig,
	structureType: StructureType,
	currentLevel: number
) {
	const structureConfig = gameConfig.structures.find((s) => s.type === structureType);

	if (!structureConfig) {
		throw new Error(`Structure ${structureType} does not exist`);
	}

	return (
		structureConfig.energy_consumption.base *
		(1 + (structureConfig.energy_consumption.percent_increase_per_level * currentLevel) / 100)
	);
}

export function calculateStructureEnergyProduction(
	gameConfig: GameConfig,
	structureType: StructureType,
	currentLevel: number
) {
	const structureConfig = gameConfig.structures.find((s) => s.type === structureType);

	if (!structureConfig) {
		throw new Error(`Structure ${structureType} does not exist`);
	}

	if (!structureConfig.production.base || !structureConfig.production.percent_increase_per_level) {
		return 0;
	}

	return (
		structureConfig.production.base *
		(1 + (structureConfig.production.percent_increase_per_level * currentLevel) / 100)
	);
}
