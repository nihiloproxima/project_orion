import { Timestamp } from 'firebase-admin/firestore';
import { DefenseType, GameConfig, Planet, ShipType, StructureType, TechnologyId, UserResearchs } from '../models';
import { GROWTH_FACTOR } from './constants';
import { BASE_POINTS } from './constants';

const utils = {
	getShipConfig: (gameConfig: GameConfig, type: ShipType) => {
		const shipConfig = gameConfig.ships.find((s) => s.type === type);
		if (!shipConfig) {
			throw new Error(`Ship config not found with type ${type}`);
		}
		return shipConfig;
	},

	getDefenseConfig: (gameConfig: GameConfig, type: DefenseType) => {
		const defenseConfig = gameConfig.defenses.find((d) => d.type === type);
		if (!defenseConfig) {
			throw new Error(`Defense config not found with type ${type}`);
		}
		return defenseConfig;
	},

	getStructureConfig: (gameConfig: GameConfig, type: StructureType) => {
		const structureConfig = gameConfig.structures.find((s) => s.type === type);
		if (!structureConfig) {
			throw new Error(`Structure config not found with type ${type}`);
		}
		return structureConfig;
	},

	getResearchConfig: (gameConfig: GameConfig, id: string) => {
		const researchConfig = gameConfig.researchs.find((r) => r.id === id);
		if (!researchConfig) {
			throw new Error(`Research config not found with id ${id}`);
		}
		return researchConfig;
	},

	getUserResearch: (userResearchs: UserResearchs, id: TechnologyId) => {
		const research = userResearchs.technologies[id];
		if (!research) {
			throw new Error(`Research not found with id ${id}`);
		}

		return research;
	},

	getStructure: (planet: Planet, type: StructureType) => {
		const structure = planet.structures.find((s) => s.type === type);
		if (!structure) {
			throw new Error(`Structure not found with type ${type}`);
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
