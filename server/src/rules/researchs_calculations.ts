import { GameConfig, UserResearchs, TechnologyId, UnlockableType } from '../models';
import utils from './utils';

const researchsCalculations = {
	getTechnologyBonus(
		gameConfig: GameConfig,
		userResearchs: UserResearchs,
		researchEffectType: UnlockableType
	): number {
		let coef = 1;

		for (const research of gameConfig.researchs) {
			const techLevel = userResearchs.technologies[research.id]?.level || 0;
			if (techLevel === 0) continue;

			for (const effect of research.effects) {
				if (effect.type === researchEffectType) {
					if (effect.per_level) {
						coef += (effect.value * techLevel) / 100;
					} else {
						coef += effect.value / 100;
					}
				}
			}
		}

		return coef;
	},

	calculateResearchTimeMs(gameConfig: GameConfig, userResearchs: UserResearchs, technologyId: TechnologyId): number {
		const researchConfig = utils.getResearchConfig(gameConfig, technologyId);
		const currentResearch = userResearchs.technologies[technologyId];

		const coef = 1 + (researchConfig.time.percent_increase_per_level * currentResearch.level) / 100;
		const seconds = researchConfig.time.base_seconds * coef;
		const researchTime = seconds / gameConfig.speed.researchs;

		return utils.secondsToMs(researchTime);
	},
};

export default researchsCalculations;
