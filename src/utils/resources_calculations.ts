import {
	GameConfig,
	Planet,
	PlanetResources,
	PlanetStructures,
	ResourceType,
	Structure,
	UserResearchs,
} from '../models';

export interface ResourceGenerationRates {
	metal: number;
	microchips: number;
	deuterium: number;
	energy?: number;
}

export type StorageCapacities = {
	[key in ResourceType]: number;
};

export function calculateStorageCapacities(gameConfig: GameConfig, structures: Structure[]): StorageCapacities {
	// Default storage values
	const capacities: StorageCapacities = {
		metal: 1000,
		microchips: 500,
		deuterium: 500,
		energy: 0,
	};

	// Add storage from buildings
	structures.forEach((structure) => {
		const config = gameConfig.structures.find((s) => s.type === structure.type);
		if (!config || !config.storage.resource || !config.storage.increase_per_level) return;

		capacities[config.storage.resource] += config.storage.increase_per_level * structure.level;
	});

	return capacities;
}

export function calculateResearchProductionBoost(
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
		if (techLevel === 0) continue;
		const effect = tech.effects.find((e) => e.resource_type === resource);
		if (!effect) continue;

		if (!effect.per_level) {
			bonus += effect.value;
			continue;
		}

		bonus += (effect.value * techLevel) / 100;
	}

	return bonus;
}

export function calculateBaseRates(
	gameConfig: GameConfig,
	structures: Structure[],
	userResearchs: UserResearchs,
	biome: Planet['biome']
): ResourceGenerationRates {
	const rates: ResourceGenerationRates = {
		metal: 0,
		microchips: 0,
		deuterium: 0,
		energy: 0,
	};

	structures.forEach((structure) => {
		const structureConfig = gameConfig.structures.find((s) => s.type === structure.type);
		if (!structureConfig) return;

		if (structureConfig?.production.resource) {
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
				const biomeProductionBoost =
					1 + (gameConfig.biomes[biome]?.[structureConfig.production.resource] ?? 0) / 100;

				rates[structureConfig.production.resource] +=
					baseProduction * productionBoost * biomeProductionBoost * gameConfig.speed.resources;
			}
		}
	});

	return rates;
}

export function calculateEnergyBalance(
	gameConfig: GameConfig,
	userResearchs: UserResearchs,
	structures: Structure[]
): { production: number; consumption: number } {
	let production = 0;
	let consumption = 0;

	const energyEfficiencyTech = userResearchs.technologies['energy_efficiency'];
	let efficiencyBonus = 1;
	if (energyEfficiencyTech) {
		const config = gameConfig.researchs.find((r) => r.id === 'energy_efficiency');
		if (config) {
			efficiencyBonus = 1 + (energyEfficiencyTech.level * config.effects[0].value) / 100;
		}
	}

	structures.forEach((structure) => {
		const structureConfig = gameConfig.structures.find((s) => s.type === structure.type);
		if (!structureConfig) return;
		if (structure.level === 0) return;

		if (structureConfig.production.resource === 'energy') {
			const base = structureConfig.production.base || 0;
			const percentIncrease = structureConfig.production.percent_increase_per_level || 0;

			const perLevelCoef = 1 + (percentIncrease * structure.level) / 100;
			production += base * perLevelCoef * efficiencyBonus;
		}

		const sonsumptionCoefPerLevel =
			1 + (structureConfig.energy_consumption.percent_increase_per_level * structure.level) / 100;

		consumption += structureConfig.energy_consumption.base * sonsumptionCoefPerLevel;
	});

	return { production, consumption };
}

export function calculateResourceGeneration(
	gameConfig: GameConfig,
	structures: Structure[],
	userResearchs: UserResearchs,
	elapsedTimeSeconds: number,
	currentResources: PlanetResources,
	biome: Planet['biome']
): ResourceGenerationRates & {
	energy_balance: { production: number; consumption: number };
} {
	const storageCapacities = calculateStorageCapacities(gameConfig, structures);
	const rates = calculateBaseRates(gameConfig, structures, userResearchs, biome);

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
		energy_balance: calculateEnergyBalance(gameConfig, userResearchs, structures),
	};
}

export function calculateHourlyRates(
	structures: Structure[],
	gameConfig: GameConfig,
	planetResources: PlanetResources,
	userResearchs: UserResearchs,
	biome: Planet['biome']
): ResourceGenerationRates {
	return calculateResourceGeneration(gameConfig, structures, userResearchs, 3600, planetResources, biome);
}

export function calculateCurrentResources(
	planetResources: PlanetResources,
	structures: Structure[],
	gameConfig: GameConfig,
	lastUpdateTimestamp: number,
	userResearchs: UserResearchs,
	biome: Planet['biome']
): ResourceGenerationRates {
	const elapsedSeconds = (Date.now() - lastUpdateTimestamp) / 1000;
	const generatedResources = calculateResourceGeneration(
		gameConfig,
		structures,
		userResearchs,
		elapsedSeconds,
		planetResources,
		biome
	);

	return {
		metal: planetResources.metal + generatedResources.metal,
		microchips: planetResources.microchips + generatedResources.microchips,
		deuterium: planetResources.deuterium + generatedResources.deuterium,
	};
}

export function calculatePlanetResources(
	gameConfig: GameConfig,
	planetStructures: PlanetStructures,
	planetResources: PlanetResources,
	userResearchs: UserResearchs,
	biome: Planet['biome']
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
		planetResources,
		biome
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
		energy: resourceGeneration.energy_balance.production,
		updated_at: now,
	};

	return updatedResources;
}
