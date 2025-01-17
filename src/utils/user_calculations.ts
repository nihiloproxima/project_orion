const BASE_POINTS = 100;
const GROWTH_FACTOR = 1.5;

export function calculateReputationLevel(reputationPoints: number): number {
	// If no points, return level 0
	if (reputationPoints <= 0) {
		return 0;
	}

	// If no points, return level 0
	if (reputationPoints <= 0) {
		return 0;
	}

	// Formula: level = floor(log(points/base + 1) / log(growth_factor))
	// This creates an exponential curve where each level requires more points
	const level = Math.floor(Math.log(reputationPoints / BASE_POINTS + 1) / Math.log(GROWTH_FACTOR));

	return level;
}

export function getRequiredPointsForLevel(level: number): number {
	// Formula: points = base * (growth_factor^level - 1)
	return Math.floor(BASE_POINTS * (Math.pow(GROWTH_FACTOR, level) - 1));
}
