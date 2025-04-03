import { GameConfig, Planet, StructureType } from 'shared-types';
import _ from 'lodash';
import utils from './utils';

const structuresCalculations = {
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
