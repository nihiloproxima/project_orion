import { Timestamp } from 'firebase-admin/firestore';
import { GameConfig, UserResearchs, Planet, Structure, ResourceType } from 'shared-types';
import _ from 'lodash';

export interface ResourceGenerationRates {
	metal: number;
	microchips: number;
	deuterium: number;
	energy?: number;
}

export type StorageCapacities = {
	[key in ResourceType]: number;
};

const planetCalculations = {
	calculatePlanetResources: (gameConfig: GameConfig, planet: Planet, userResearchs: UserResearchs) => {
		const now = Date.now();
		const elapsedSeconds = (now - planet.resources.last_update.toMillis()) / 1000;

		const resourceGeneration = planetCalculations.calculateResourceGeneration(
			gameConfig,
			planet,
			userResearchs,
			elapsedSeconds
		);

		// Calculate production malus based on energy balance
		let productionMalus = 1;
		const energyDeficit =
			resourceGeneration.energy_balance.production - resourceGeneration.energy_balance.consumption;
		if (energyDeficit < 0) {
			productionMalus = Math.max(0, 1 + energyDeficit / resourceGeneration.energy_balance.consumption);
		}

		// Calculate current resources with energy malus applied
		planet.resources = {
			metal: planet.resources.metal + resourceGeneration.metal * elapsedSeconds * productionMalus,
			microchips: planet.resources.microchips + resourceGeneration.microchips * elapsedSeconds * productionMalus,
			deuterium: planet.resources.deuterium + resourceGeneration.deuterium * elapsedSeconds * productionMalus,
			energy: resourceGeneration.energy_balance.production,
			last_update: Timestamp.fromMillis(now),
		};

		return planet;
	},

	calculateStorageCapacities(gameConfig: GameConfig, structures: Structure[]): StorageCapacities {
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
			if (!config || !config.storage.resource) return;

			const storage = _.toFinite(config.storage.base) + _.toFinite(config.storage.per_level) * structure.level;

			capacities[config.storage.resource] += storage;
		});

		return capacities;
	},

	calculateEnergyBalance(
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
				const perLevel = structureConfig.production.per_level || 0;

				production += (base + perLevel * structure.level) * efficiencyBonus;
			}

			const consumptionPerLevel = _.toFinite(
				structureConfig.energy_consumption.base + structureConfig.energy_consumption.per_level * structure.level
			);

			consumption += consumptionPerLevel;
		});

		return { production, consumption };
	},

	calculateBaseRates(
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
			if (!structureConfig || !structureConfig.production.resource) return;

			const baseProduction = _.toFinite(structureConfig.production.base);
			const perLevel = _.toFinite(structureConfig.production.per_level);
			const productionBoost = this.calculateResearchProductionBoost(
				gameConfig,
				userResearchs,
				structureConfig.production.resource
			);
			const biomeProductionBoost =
				1 + (gameConfig.biomes[biome]?.[structureConfig.production.resource] ?? 0) / 100;

			rates[structureConfig.production.resource] +=
				(baseProduction + perLevel * structure.level) *
				productionBoost *
				biomeProductionBoost *
				gameConfig.speed.resources;
		});

		return rates;
	},

	calculateResearchProductionBoost(
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
	},

	calculateResourceGeneration(
		gameConfig: GameConfig,
		planet: Planet,
		userResearchs: UserResearchs,
		elapsedTimeSeconds: number
	): ResourceGenerationRates & {
		energy_balance: { production: number; consumption: number };
	} {
		const storageCapacities = this.calculateStorageCapacities(gameConfig, planet.structures);
		const rates = this.calculateBaseRates(gameConfig, planet.structures, userResearchs, planet.biome);

		// Apply storage limits
		Object.keys(rates).forEach((resource) => {
			const resourceKey = resource as keyof typeof rates;
			if (resourceKey === 'energy') return; // Energy isn't stored

			const currentAmount = planet.resources[resourceKey];
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
			energy_balance: this.calculateEnergyBalance(gameConfig, userResearchs, planet.structures),
		};
	},
};

export default planetCalculations;
