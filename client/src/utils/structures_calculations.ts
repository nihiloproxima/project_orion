import { GameConfig, Planet, ResourceType, StructureType, UserResearchs } from 'shared-types';
import _ from 'lodash';
import planetCalculations from './planet_calculations';
import utils from '@/lib/utils';

const structuresCalculations = {
	structureHourlyProduction: (params: {
		gameConfig: GameConfig;
		planet: Planet;
		userResearchs: UserResearchs;
		structureType: StructureType;
		structureLevel: number;
	}): { resourceType: ResourceType; amount: number } => {
		const structureConfig = params.gameConfig.structures.find((s) => s.type === params.structureType);
		if (!structureConfig || !structureConfig.production.resource)
			return {
				resourceType: 'metal',
				amount: 0,
			};

		const baseProduction = _.toFinite(structureConfig.production.base);
		const perLevel = _.toFinite(structureConfig.production.per_level);
		const productionBoost = planetCalculations.calculateResearchProductionBoost(
			params.gameConfig,
			params.userResearchs,
			structureConfig.production.resource
		);
		const biomeProductionBoost =
			1 + (params.gameConfig.biomes[params.planet.biome]?.[structureConfig.production.resource] ?? 0) / 100;

		const productionPerSecond =
			(baseProduction + perLevel * params.structureLevel) *
			productionBoost *
			biomeProductionBoost *
			params.gameConfig.speed.resources;

		const result = productionPerSecond * 3600;

		return {
			resourceType: structureConfig.production.resource,
			amount: result,
		};
	},

	structureEnergyConsumption: (params: {
		gameConfig: GameConfig;
		structureType: StructureType;
		structureLevel: number;
	}) => {
		const structureConfig = utils.getStructureConfig(params.gameConfig, params.structureType);
		if (!structureConfig.energy_consumption) return 0;

		const consumption =
			_.toFinite(structureConfig.energy_consumption.base) +
			_.toFinite(structureConfig.energy_consumption.per_level) * params.structureLevel;

		return consumption;
	},

	structureEnergyProduction: (params: {
		gameConfig: GameConfig;
		planet: Planet;
		userResearchs: UserResearchs;
		structureType: StructureType;
		structureLevel: number;
	}) => {
		if (params.structureType !== 'energy_plant') return 0;

		const structureConfig = utils.getStructureConfig(params.gameConfig, params.structureType);

		const baseProduction = _.toFinite(structureConfig.production.base);
		const perLevel = _.toFinite(structureConfig.production.per_level);
		const productionBoost = planetCalculations.calculateResearchProductionBoost(
			params.gameConfig,
			params.userResearchs,
			structureConfig.production.resource!
		);
		const biomeProductionBoost =
			1 + (params.gameConfig.biomes[params.planet.biome]?.[structureConfig.production.resource!] ?? 0) / 100;

		const production =
			(baseProduction + perLevel * params.structureLevel) *
			productionBoost *
			biomeProductionBoost *
			params.gameConfig.speed.resources;

		return production;
	},

	structureStorageCapacities: (params: {
		gameConfig: GameConfig;
		structureType: StructureType;
		structureLevel: number;
	}) => {
		const structureConfig = utils.getStructureConfig(params.gameConfig, params.structureType);
		if (!structureConfig.storage.resource) return;

		const capacity =
			_.toFinite(structureConfig.storage.base) +
			_.toFinite(structureConfig.storage.per_level) * params.structureLevel;

		return {
			resourceType: structureConfig.storage.resource,
			capacity: capacity,
		};
	},

	upgradeStructureCost: (params: {
		base: number;
		per_level: number | null;
		power: number | null;
		level: number;
		reductionCoef: number;
	}) => {
		if (params.per_level) {
			return _.floor((params.base + params.per_level * params.level) * params.reductionCoef, -1);
		}

		if (params.power) {
			return _.floor(Math.pow(params.base * params.level, params.power) * params.reductionCoef, -1);
		}

		return _.floor(params.base * params.reductionCoef, -1);
	},

	canUpgradeStructure: (
		gameConfig: GameConfig,
		planet: Planet,
		newStructureType: StructureType,
		currentLevel: number,
		levelsToAdd: number
	): {
		allowed: boolean;
		metal_cost: number;
		reason?: string;
	} => {
		const structureConfig = utils.getStructureConfig(gameConfig, newStructureType);

		const targetLevels = _.range(currentLevel + 1, currentLevel + levelsToAdd + 1);
		const metalCost = targetLevels.reduce((total: number, targetLevel: number) => {
			return (
				total +
				structuresCalculations.upgradeStructureCost({
					base: structureConfig.cost.base,
					per_level: structureConfig.cost.per_level,
					power: structureConfig.cost.power,
					level: targetLevel,
					reductionCoef: 1,
				})
			);
		}, 0);

		if (planet.resources.metal < metalCost) {
			return {
				allowed: false,
				metal_cost: metalCost,
				reason: `Not enough metal. Expected ${metalCost}, have ${planet.resources.metal}`,
			};
		}

		return {
			allowed: true,
			metal_cost: metalCost,
		};
	},
};

export default structuresCalculations;
