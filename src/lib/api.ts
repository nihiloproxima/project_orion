import { StructureType } from '@/models/planet';
import { auth } from './firebase';

function getAuthToken() {
	return auth.currentUser?.getIdToken();
}

async function post(group: string, endpoint: string, data: Record<string, any>) {
	const token = await getAuthToken();
	const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${group}/${endpoint}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `${token}`,
		},
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	return response.json();
}

export const api = {
	claimShipFromShipyard: async (planetId: string, commandIndex: number) => {
		return post('game', 'claimShipFromShipyard', {
			planet_id: planetId,
			command_index: commandIndex,
		});
	},

	getPlanets: async (galaxy: number) => {
		return post('game', 'getPlanets', {
			galaxy: galaxy,
		});
	},
	buildShip: async (planetId: string, blueprintId: string, componentsIds: string[]) => {
		return post('game', 'buildShip', {
			planet_id: planetId,
			blueprint_id: blueprintId,
			components_ids: componentsIds,
		});
	},
	renameShip: async (shipId: string, newName: string) => {
		return post('game', 'renameShip', {
			ship_id: shipId,
			name: newName,
		});
	},
	startResearch: async (technologyId: string, planetId: string) => {
		return post('game', 'startResearch', {
			technology_id: technologyId,
			planet_id: planetId,
		});
	},
	sendMessage: async (channelId: string, text: string) => {
		return post('game', 'sendChatMessage', { channel_id: channelId, text });
	},
	createUser: (name: string, avatar: number) => post('game', 'createUser', { name, avatar }),
	updateUser: (name: string, avatar: number) => post('game', 'updateUser', { name, avatar }),
	selectHomeworld: (planetId: string) => post('game', 'selectHomeworld', { planet_id: planetId }),
	claimTaskRewards: (taskId: string) => post('game', 'claimTaskRewards', { task_id: taskId }),
	collectReward: (rewardId: string) => post('game', 'collectReward', { reward_id: rewardId }),
	renamePlanet: (planetId: string, newName: string) =>
		post('game', 'renamePlanet', { planet_id: planetId, new_name: newName }),
	upgradeStructure: async (planetId: string, structureType: StructureType, upgradeCount: number) => {
		return post('game', 'upgradeStructure', {
			planet_id: planetId,
			structure_type: structureType,
			upgrades_counts: upgradeCount,
		});
	},
	getShipBlueprints: async () => {
		return post('game', 'getShipBlueprints', {});
	},
	getShipComponents: async () => {
		return post('game', 'getShipComponents', {});
	},
	getShips: async (planetId: string) => {
		return post('game', 'getShips', {
			planet_id: planetId,
		});
	},
	getShipyardQueue: async (planetId: string) => {
		return post('game', 'getShipyardQueue', {
			planet_id: planetId,
		});
	},
	getRankings: async (params: {
		page: number;
	}): Promise<{
		status: 'ok';
		rankings: {
			user_id: string;
			name: string;
			avatar: string;
			score: number;
			planets_count: number;
		}[];
		page: number;
		users_per_page: number;
	}> => {
		return post('game', 'getUsersRanking', params);
	},
	updateMail: async (params: { mail_id: string; read?: boolean; deleted?: boolean; archived?: boolean }) => {
		return post('game', 'updateMail', params);
	},
	updateUserLanguage: async (language: string): Promise<void> => {
		return post('game', 'updateUserLanguage', { language });
	},
};
