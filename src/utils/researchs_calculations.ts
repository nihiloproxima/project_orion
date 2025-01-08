import { GameConfig, UnlockableType, UserResearchs } from '../models';

export function getTechnologyBonus(
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
}

// Research bonus is a multiplier that is applied to the production of a resource
export function calculateResearchBonus(
	gameConfig: GameConfig,
	userResearchs: UserResearchs,
	resourceType: 'metal' | 'deuterium' | 'microchips' | 'science' | 'energy'
): number {
	let bonus = 1;

	// Loop through all available researches
	for (const [researchId, research] of Object.entries(gameConfig.researchs)) {
		// Skip if technology not researched
		if (!userResearchs.technologies[researchId]) continue;

		// Check each effect
		for (const effect of research.effects) {
			if (effect.type === 'resource_boost' && effect.resource_type === resourceType) {
				const level = userResearchs.technologies[researchId].level;
				const value = effect.value;
				if (effect.per_level) {
					bonus += (level * value) / 100;
				} else {
					bonus += value / 100;
				}
			}
		}
	}

	return bonus;
}
