import { GameConfig } from '@/models/game_config';

import { DefenseConfig } from '@/models/defenses_config';

export function calculateDefenseConstructionTimeSeconds(
	gameConfig: GameConfig,
	defenseConfig: DefenseConfig,
	defenseFactoryLevel: number,
	amount: number
): number {
	const structConfig = gameConfig.structures.find((s) => s.type === 'defense_factory');
	if (!structConfig) {
		throw new Error('Defense factory config not found');
	}

	// Construction time in seconds from config with amount
	const time = defenseConfig.construction_time * amount;

	// Defense factory level reduces construction time by 5% per level
	const reductionFactor = 1 - (structConfig.production.percent_increase_per_level ?? 0) * defenseFactoryLevel;

	return Math.floor(time * reductionFactor);
}
