import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

import { GameConfig, Planet, StructureType, TechnologyId, UserResearchs } from '../models';
import { Timestamp } from 'firebase/firestore';

const utils = {
	formatTimerTime: (seconds: number) => {
		const days = Math.floor(seconds / (60 * 60 * 24));
		const hours = Math.floor((seconds % (60 * 60 * 24)) / (60 * 60));
		const minutes = Math.floor((seconds % (60 * 60)) / 60);
		const remainingSeconds = Math.floor(seconds % 60);

		return [
			days > 0 && `${days}d`,
			hours > 0 && `${hours}h`,
			minutes > 0 && `${minutes}m`,
			remainingSeconds > 0 && `${remainingSeconds}s`,
		]
			.filter(Boolean)
			.join(' ');
	},

	formatTimeString: (timeRemainingMs: number) => {
		const days = Math.floor(timeRemainingMs / (1000 * 60 * 60 * 24));
		const hours = Math.floor((timeRemainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		const minutes = Math.floor((timeRemainingMs % (1000 * 60 * 60)) / (1000 * 60));
		const seconds = Math.floor((timeRemainingMs % (1000 * 60)) / 1000);

		const result = [days > 0 && `${days}d`, hours > 0 && `${hours}h`, minutes > 0 && `${minutes}m`, `${seconds}s`]
			.filter(Boolean)
			.join(' ');

		return result;
	},

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
};

export default utils;
