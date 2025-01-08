import { PlanetStructures, Structure } from '../models/planet_structures';
import { GameConfig } from '../models/game_config';
import { PlanetResources, ResourceType } from '../models/planets_resources';
import { UserResearchs } from '../models/user_researchs';
import { StorageCapacities } from './structures_calculations';

export interface ResourceGenerationRates {
	metal: number;
	microchips: number;
	deuterium: number;
	science: number;
	energy?: number;
}

export function calculateStorageCapacities(gameConfig: GameConfig, structures: Structure[]): StorageCapacities {
	// Default storage values
	const capacities: StorageCapacities = {
		metal: 1000,
		microchips: 500,
		deuterium: 500,
		science: 500,
		energy: 0,
	};

	// Add storage from buildings
	structures.forEach((structure) => {
		if (structure.type.includes('storage')) {
			const config = gameConfig.structures.find((s) => s.type === structure.type);
			if (!config || !config.storage.resource || !config.storage.increase_per_level) return;

			capacities[config.storage.resource] += config.storage.increase_per_level * structure.level;
		}
	});

	return capacities;
}

function calculateResearchProductionBoost(
	gameConfig: GameConfig,
	userResearchs: UserResearchs,
	resource: ResourceType
): number {
	const resourcesTechs = gameConfig.researchs.filter((r) => r.category === 'resource');

	const techs = resourcesTechs.filter((r) => r.effects.some((e) => e.resource_type === resource));
	if (techs.length === 0) return 1;

	let bonus = 1;

	for (const tech of techs) {
		const techLevel = userResearchs.technologies[tech.id].level;
		const effect = tech.effects.find((e) => e.resource_type === resource);
		if (!effect) continue;

		const techBonus = effect.value + (effect.per_level ? effect.value * techLevel : 0);
		bonus += techBonus;
	}

	return bonus;
}

export function calculateBaseRates(
	gameConfig: GameConfig,
	structures: Structure[],
	userResearchs: UserResearchs
): ResourceGenerationRates {
	const rates: ResourceGenerationRates = {
		metal: 0,
		microchips: 0,
		deuterium: 0,
		science: 0,
		energy: 0,
	};

	structures.forEach((structure) => {
		const structureConfig = gameConfig.structures.find((s) => s.type === structure.type);
		if (!structureConfig) return;

		if (!structure.is_under_construction && structureConfig?.production.resource) {
			if (
				structureConfig.production.base !== null &&
				structureConfig.production.percent_increase_per_level !== null
			) {
				const baseProduction =
					structureConfig.production.base *
					(1 + (structureConfig.production.percent_increase_per_level * structure.level) / 100);

				// Apply production boost from technologies
				const productionBoost = calculateResearchProductionBoost(
					gameConfig,
					userResearchs,
					structureConfig.production.resource
				);

				rates[structureConfig.production.resource] += baseProduction * productionBoost;
			}
		}
	});

	return rates;
}

export function calculateEnergyBalance(
	gameConfig: GameConfig,
	structures: Structure[]
): { production: number; consumption: number } {
	let production = 0;
	let consumption = 0;

	structures.forEach((structure) => {
		const structureConfig = gameConfig.structures.find((s) => s.type === structure.type);
		if (!structureConfig) return;

		if (!structure.is_under_construction) {
			if (structureConfig.production.resource === 'energy') {
				const base = structureConfig.production.base || 0;
				const percentIncrease = structureConfig.production.percent_increase_per_level || 0;

				production += base * (1 + (percentIncrease * structure.level) / 100);
			}

			consumption +=
				structureConfig.energy_consumption.base *
				(1 + (structureConfig.energy_consumption.percent_increase_per_level * structure.level) / 100);
		}
	});

	return { production, consumption };
}

export function calculateResourceGeneration(
	gameConfig: GameConfig,
	structures: Structure[],
	userResearchs: UserResearchs,
	elapsedTimeSeconds: number,
	currentResources: PlanetResources
): ResourceGenerationRates & {
	energy_balance: { production: number; consumption: number };
} {
	const storageCapacities = calculateStorageCapacities(gameConfig, structures);
	const rates = calculateBaseRates(gameConfig, structures, userResearchs);

	// Apply storage limits
	Object.keys(rates).forEach((resource) => {
		const resourceKey = resource as keyof typeof rates;
		if (resourceKey === 'energy') return; // Energy isn't stored

		const currentAmount = currentResources[resourceKey];
		const maxAmount = storageCapacities[resourceKey];

		if (currentAmount >= maxAmount) {
			rates[resourceKey] = 0; // Stop production if storage is full
		} else {
			// Calculate how much can be produced before hitting cap
			const remainingSpace = maxAmount - currentAmount;
			const wouldProduce = rates[resourceKey] * elapsedTimeSeconds;
			if (wouldProduce > remainingSpace) {
				rates[resourceKey] = remainingSpace / elapsedTimeSeconds;
			}
		}
	});

	return {
		...rates,
		energy_balance: calculateEnergyBalance(gameConfig, structures),
	};
}

export function calculateHourlyRates(
	structures: Structure[],
	gameConfig: GameConfig,
	planetResources: PlanetResources,
	userResearchs: UserResearchs
): ResourceGenerationRates {
	return calculateResourceGeneration(gameConfig, structures, userResearchs, 3600, planetResources);
}

export function calculateCurrentResources(
	planetResources: PlanetResources,
	structures: Structure[],
	gameConfig: GameConfig,
	lastUpdateTimestamp: number,
	userResearchs: UserResearchs
): ResourceGenerationRates {
	const elapsedSeconds = (Date.now() - lastUpdateTimestamp) / 1000;
	const generatedResources = calculateResourceGeneration(
		gameConfig,
		structures,
		userResearchs,
		elapsedSeconds,
		planetResources
	);

	return {
		metal: planetResources.metal + generatedResources.metal,
		microchips: planetResources.microchips + generatedResources.microchips,
		deuterium: planetResources.deuterium + generatedResources.deuterium,
		science: planetResources.science + generatedResources.science,
	};
}

export function calculatePlanetResources(
	gameConfig: GameConfig,
	planetStructures: PlanetStructures,
	planetResources: PlanetResources,
	userResearchs: UserResearchs
) {
	const now = Date.now();
	const lastUpdate = planetResources.updated_at;
	const elapsedSeconds = (now - lastUpdate) / 1000;

	// Calculate current production rates and energy balance
	const resourceGeneration = calculateResourceGeneration(
		gameConfig,
		planetStructures.structures,
		userResearchs,
		elapsedSeconds,
		planetResources
	);

	// Calculate production malus based on energy balance
	let productionMalus = 1;
	const energyDeficit = resourceGeneration.energy_balance.production - resourceGeneration.energy_balance.consumption;
	if (energyDeficit < 0) {
		productionMalus = Math.max(0, 1 + energyDeficit / resourceGeneration.energy_balance.consumption);
	}

	// Calculate current resources with energy malus applied
	const updatedResources: PlanetResources = {
		...planetResources,
		metal: planetResources.metal + resourceGeneration.metal * elapsedSeconds * productionMalus,
		microchips: planetResources.microchips + resourceGeneration.microchips * elapsedSeconds * productionMalus,
		deuterium: planetResources.deuterium + resourceGeneration.deuterium * elapsedSeconds * productionMalus,
		science: planetResources.science + resourceGeneration.science * elapsedSeconds * productionMalus,
		energy: resourceGeneration.energy_balance.production,
		updated_at: now,
	};

	return updatedResources;
}
