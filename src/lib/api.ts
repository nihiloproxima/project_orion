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
	selectHomeworld: (planetId: string) => post('game', 'chooseHomeworld', { planet_id: planetId }),
	claimTaskRewards: (taskId: string) => post('game', 'claimTaskRewards', { task_id: taskId }),
	collectReward: (rewardId: string) => post('game', 'collectReward', { reward_id: rewardId }),
	renamePlanet: (planetId: string, newName: string) =>
		post('game', 'renamePlanet', { planet_id: planetId, new_name: newName }),
	upgradeStructure: async (planetId: string, structureType: StructureType, upgradeCount: number) => {
		return post('game', 'upgradeStructure', {
			planet_id: planetId,
			structure_type: structureType,
			upgrade_count: upgradeCount,
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
};
