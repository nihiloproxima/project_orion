import { GameConfig, ResourceType, StructureType, UserResearchs } from '../models';
import { calculateProductionBonus, getTechnologyBonus } from './researchs_calculations';

interface HourlyProductionResult {
	resource: ResourceType | null;
	amount: number;
	energyConsumption: number;
}

export type StorageCapacities = {
	[key in ResourceType]?: number;
};

export function calculateStructureHourlyProduction(
	gameConfig: GameConfig,
	userResearchs: UserResearchs,
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
	if (structure.production.resource && structure.production.base && structure.production.percent_increase_per_level) {
		const productionBonus = calculateProductionBonus(gameConfig, userResearchs, structure.production.resource);
		const levelCoef = 1 + (structure.production.percent_increase_per_level * level) / 100;
		const production = structure.production.base * levelCoef * productionBonus * gameConfig.speed.resources;
		hourlyProduction = production * 3600; // Convert per-second to per-hour
	}

	// Calculate energy consumption
	const energyConsumption = calculateStructureEnergyConsumption(gameConfig, structureType, level);

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
	const structureConfig = gameConfig.structures.find((s) => s.type === structureType);
	if (!structureConfig) {
		return { metal: 0, microchips: 0, deuterium: 0, energy: 0 };
	}

	// Default storage values
	const capacities: StorageCapacities = {
		metal: 0,
		microchips: 0,
		deuterium: 0,
		energy: 0,
	};

	// Calculate storage capacity if it's a storage structure

	if (structureConfig.storage.resource && structureConfig.storage.increase_per_level) {
		capacities[structureConfig.storage.resource] = structureConfig.storage.increase_per_level * level;
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

	// Apply game speed multiplier

	// Apply construction speed bonus (lower is faster)
	let finalTimeMs = (baseTimeMs * levelScaling * constructionSpeedCoef) / config.speed.construction;

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
	if (currentLevel === 0) return 0;

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
	userResearchs: UserResearchs,
	structureType: StructureType,
	currentLevel: number
) {
	const structureConfig = gameConfig.structures.find((s) => s.type === structureType);

	if (!structureConfig) {
		throw new Error(`Structure ${structureType} does not exist`);
	}

	const researchConfig = gameConfig.researchs.find((r) => r.id === 'energy_efficiency');
	if (!researchConfig) return 0;

	const researchLevel = userResearchs.technologies[researchConfig.id].level;
	const researchBonus = 1 + (researchConfig.effects[0].value * researchLevel) / 100;

	if (
		!structureConfig.production.base ||
		!structureConfig.production.percent_increase_per_level ||
		structureConfig.production.resource !== 'energy'
	) {
		return 0;
	}

	const perLevelCoef = 1 + (structureConfig.production.percent_increase_per_level * currentLevel) / 100;
	const result = structureConfig.production.base * perLevelCoef * researchBonus;

	return result;
}
