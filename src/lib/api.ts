import { ResourcePayload } from '@/models/fleet_movement';
import { MissionType, ShipType } from '../models/ship';
import { supabase } from './supabase';
import { StructureType } from '@/models/planet_structures';
import { DefenseType } from '@/models/planet_defenses';

function getAuthToken() {
	return supabase.auth.getSession().then(({ data: { session } }) => {
		return session?.access_token;
	});
}

async function post(group: string, endpoint: string, data: Record<string, any>) {
	const token = await getAuthToken();
	const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${group}/${endpoint}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	return response.json();
}

export const api = {
	admin: {
		updateConfig: async (id: string, config_data: Record<string, any>) => {
			return post('admin', 'updateConfig', { id, config_data });
		},
	},
	researchs: {
		startResearch: async (technologyId: string, planetId: string) => {
			return post('researchs', 'startResearch', {
				technology_id: technologyId,
				planet_id: planetId,
			});
		},
	},
	chat: {
		sendMessage: async (channelId: string, text: string) => {
			return post('chat', 'sendMessage', { channel_id: channelId, text });
		},
	},
	users: {
		register: (name: string, avatar: string) => post('users', 'register', { name, avatar }),
		update: (name: string, avatar: string) => post('users', 'update', { name, avatar }),
		chooseHomeworld: (planetId: string) => post('users', 'chooseHomeworld', { planet_id: planetId }),
		claimTaskRewards: (taskId: string) => post('users', 'claimTaskRewards', { task_id: taskId }),
		collectReward: (rewardId: string) => post('users', 'collectReward', { reward_id: rewardId }),
		renamePlanet: (planetId: string, newName: string) =>
			post('users', 'renamePlanet', { planet_id: planetId, new_name: newName }),
	},
	structures: {
		construct: async (planetId: string, type: StructureType) => {
			return post('structures', 'construct', {
				planet_id: planetId,
				structure_type: type,
			});
		},
		startConstruction: async (planetId: string, type: StructureType) => {
			return post('structures', 'startConstruction', {
				planet_id: planetId,
				structure_type: type,
			});
		},

		resolvePendingConstructions: async (planetId: string) => {
			return post('structures', 'resolvePendingConstructions', {
				planet_id: planetId,
			});
		},
	},
	defenses: {
		buildDefense: async (type: DefenseType, planetId: string, amount: number) => {
			return post('defenses', 'buildDefense', {
				defense_type: type,
				planet_id: planetId,
				amount,
			});
		},
	},
	fleet: {
		buildShip: async (shipType: ShipType, planetId: string, amount: number) => {
			return post('fleet', 'buildShip', {
				ship_type: shipType,
				planet_id: planetId,
				amount,
			});
		},
		renameShip: async (shipId: string, newName: string) => {
			return post('fleet', 'renameShip', {
				ship_id: shipId,
				new_name: newName,
			});
		},
		sendMission: async (params: {
			from_planet_id: string;
			to_planet_id: string;
			ships_ids: string[];
			mission_type: MissionType;
			resources?: ResourcePayload;
		}) => {
			return post('fleet', 'sendMission', params);
		},
		cancelMission: async (fleet_movement_id: string) => {
			return post('fleet', 'cancelMission', {
				fleet_movement_id,
			});
		},
	},
	rankings: {
		getRankings: async (params: {
			type: 'global' | 'defense' | 'attack';
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
			return post('rankings', 'getRankings', params);
		},
	},
	mails: {
		markAsRead: async (id: string) => {
			return post('mails', 'markAsRead', { mail_id: id });
		},
		deleteMail: async (id: string) => {
			return post('mails', 'deleteMail', { mail_id: id });
		},
	},
};
