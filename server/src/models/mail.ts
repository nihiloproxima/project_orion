import { DocumentSnapshot, Timestamp } from 'firebase-admin/firestore';
import { ResearchInfo, ResourcesInfo, ShipInfo, StructureInfo } from './report';
import { MissionType } from './ship';

export type MailCategory = 'reports' | 'messages' | 'missions';
export type MailType = 'spy' | 'combat' | 'mission' | 'private_message' | 'game_message' | 'ai_message';

export interface BaseMail {
	id: string;
	type: MailType;
	category: MailCategory;
	created_at: Timestamp;
	sender_id?: string;
	sender_name: string;
	title: string;
	content?: string;
	read: boolean;
	archived: boolean;
	data: any;
	ttl: Timestamp;
}

export interface SpyMail extends BaseMail {
	type: 'spy';
	category: 'reports';
	data: {
		target_planet_id: string;
		target_owner_id: string;
		target_coordinates: {
			x: number;
			y: number;
		};
		resources: ResourcesInfo;
		structures: StructureInfo[];
		research: ResearchInfo[];
		ships: ShipInfo[];
	};
}

export interface CombatMail extends BaseMail {
	type: 'combat';
	category: 'reports';
	data: {
		battle_id: string;
		location: {
			planet_id: string;
			coordinates: { x: number; y: number };
		};
		debris_field?: {
			metal: number;
			deuterium: number;
			microchips: number;
		};
		attackers: Array<{
			user_id: string;
			name: string;
			ships: ShipInfo[];
			losses: ShipInfo[];
		}>;
		defenders: Array<{
			user_id: string;
			name: string;
			ships: ShipInfo[];
			losses: ShipInfo[];
		}>;
		result: 'attacker_victory' | 'defender_victory' | 'draw';
		loot?: {
			metal: number;
			deuterium: number;
			microchips: number;
		};
	};
}

export interface MissionMail extends BaseMail {
	type: 'mission';
	category: 'missions';
	data: {
		mission_type: MissionType;
		status: 'assigned' | 'completed' | 'failed';
		objectives: string[];
		rewards?: {
			resources?: {
				metal?: number;
				deuterium?: number;
				microchips?: number;
			};
			ships?: ShipInfo[];
			experience?: number;
		};
	};
}

export interface PrivateMessageMail extends BaseMail {
	type: 'private_message';
	category: 'messages';
	data: {
		sender_name: string;
		sender_avatar: string;
	};
}

export interface GameMessageMail extends BaseMail {
	type: 'game_message';
	category: 'messages';
	data: {
		importance: 'low' | 'medium' | 'high' | 'critical';
		auto_delete_after?: number; // timestamp when message should be auto-deleted
	};
}

export interface AiMessageMail extends BaseMail {
	type: 'ai_message';
	category: 'messages';
	data: {
		ai_name: string;
		ai_avatar: string;
		context?: string;
	};
}

export type Mail = SpyMail | CombatMail | MissionMail | PrivateMessageMail | GameMessageMail | AiMessageMail;

export function parseMail(doc: DocumentSnapshot): Mail {
	const data = doc.data();
	if (!data) {
		throw new Error('Mail not found');
	}

	return {
		id: doc.id || '',
		type: data.type || 'unknown',
		category: data.category || 'general',
		created_at: data.created_at || Timestamp.now(),
		sender_id: data.sender_id || '',
		sender_name: data.sender_name || '',
		title: data.title || '',
		content: data.content || '',
		read: data.read ?? false,
		archived: data.archived ?? false,
		data: data.data || {},
		ttl: data.ttl || Timestamp.now(),
	};
}
