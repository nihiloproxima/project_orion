import { Timestamp } from 'firebase-admin/firestore';
import { GameConfig, Planet, StructureType, TechnologyId, UserResearchs } from 'shared-types';
import { GROWTH_FACTOR } from './constants';
import { BASE_POINTS } from './constants';

const utils = {
	getStructureConfig: (gameConfig: GameConfig, type: StructureType) => {
		const structureConfig = gameConfig.structures.find((s) => s.type === type);
		if (!structureConfig) {
			throw new Error('Structure config not found');
		}
		return structureConfig;
	},

	getResearchConfig: (gameConfig: GameConfig, id: string) => {
		const researchConfig = gameConfig.researchs.find((r) => r.id === id);
		if (!researchConfig) {
			throw new Error('Research config not found');
		}
		return researchConfig;
	},

	getUserResearch: (userResearchs: UserResearchs, id: TechnologyId) => {
		const research = userResearchs.technologies[id];
		if (!research) {
			throw new Error('Research not found');
		}

		return research;
	},

	getStructure: (planet: Planet, type: StructureType) => {
		const structure = planet.structures.find((s) => s.type === type);
		if (!structure) {
			throw new Error('Structure not found');
		}
		return structure;
	},

	secondsToMs: (seconds: number) => {
		return seconds * 1000;
	},

	msToSeconds: (ms: number) => {
		return ms / 1000;
	},

	msUntil: (timestamp: Timestamp) => {
		return timestamp.toMillis() - Date.now();
	},

	calculateUserLevel(xp: number): number {
		// If no points, return level 0
		if (xp <= 0) {
			return 0;
		}

		// If no points, return level 0
		if (xp <= 0) {
			return 0;
		}

		// Formula: level = floor(log(points/base + 1) / log(growth_factor))
		// This creates an exponential curve where each level requires more points
		const level = Math.floor(Math.log(xp / BASE_POINTS + 1) / Math.log(GROWTH_FACTOR));

		return level;
	},

	getRequiredPointsForLevel(level: number): number {
		// Formula: points = base * (growth_factor^level - 1)
		return Math.floor(BASE_POINTS * (Math.pow(GROWTH_FACTOR, level) - 1));
	},
};

export default utils;
