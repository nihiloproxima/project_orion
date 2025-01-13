import { GameConfig } from '@/models/game_config';
import { DefenseType } from '@/models/defense';

export function calculateDefenseConstructionTimeSeconds(
	gameConfig: GameConfig,
	defenseType: DefenseType,
	defenseFactoryLevel: number,
	amount: number
): number {
	const structConfig = gameConfig.structures.find((s) => s.type === 'defense_factory');
	if (!structConfig) {
		throw new Error('Defense factory config not found');
	}
	const defenseConfig = gameConfig.defenses.find((d) => d.type === defenseType);
	if (!defenseConfig) {
		throw new Error('Defense config not found');
	}

	// Construction time in seconds from config
	const time = defenseConfig.construction_time;

	// Defense factory coef
	const productionPercentIncrease = structConfig.production.percent_increase_per_level ?? 0;
	const constructionTimeReductionFactor = 1 - (productionPercentIncrease * defenseFactoryLevel) / 100;

	return Math.floor(time * constructionTimeReductionFactor * amount);
}
