import _ from 'lodash';
import { Timestamp } from 'firebase-admin/firestore';
import {
	ChatMessage,
	FleetMovement,
	GameConfig,
	Mail,
	Planet,
	ShipyardQueue,
	User,
	UserInventory,
	UserResearchs,
	UserTasks,
	UserReward,
} from 'shared-types';
import {
	parseFleetMovement,
	parseMail,
	parsePlanet,
	parseShipyardQueue,
	parseUser,
	parseUserInventory,
	parseUserReward,
	parseUserTasks,
} from '../parsers';
import { db } from './firebase';
import { PartialWithFieldValue, Transaction } from 'firebase-admin/firestore';
import cache from '../cache/cache';
import * as admin from 'firebase-admin';
import { DEFAULT_GAME_CONFIG } from '../rules/constants';

export default {
	// Configs
	getGameConfig: async () => {
		const gameConfig = await cache.getGameConfig();
		if (gameConfig) {
			return gameConfig;
		}

		const ref = db.collection('config').doc('game');
		const doc = await ref.get();
		let config = doc.exists ? doc.data() : DEFAULT_GAME_CONFIG;

		await cache.setGameConfig(config as GameConfig);
		return config as GameConfig;
	},

	setGameConfig: async (tx: Transaction, data: PartialWithFieldValue<GameConfig>) => {
		const ref = db.collection('config').doc('game');
		tx.set(ref, data);

		await cache.setGameConfig(data as GameConfig);
	},

	// User
	checkUserExists: async (tx: Transaction, userId: string) => {
		const ref = db.collection('users').doc(userId);
		const user = await tx.get(ref);
		return user.exists;
	},

	getUserNoTx: async (userId: string) => {
		const ref = db.collection('users').doc(userId);
		const user = await ref.get();
		return parseUser(user);
	},

	getUser: async (tx: Transaction, userId: string) => {
		const ref = db.collection('users').doc(userId);
		const user = await tx.get(ref);
		if (!user.exists) {
			throw new Error('User not found');
		}

		return parseUser(user);
	},

	setUser: async (tx: Transaction, userId: string, data: PartialWithFieldValue<User>) => {
		const ref = db.collection('users').doc(userId);
		tx.set(ref, { ...data, updated_at: Timestamp.now() });
	},

	updateUser: async (tx: Transaction, userId: string, data: PartialWithFieldValue<User>) => {
		const ref = db.collection('users').doc(userId);
		tx.update(ref, { ...data, updated_at: Timestamp.now() });
	},

	// Planet
	getPlanetsFromGalaxyNoTx: async (season: number, galaxy: number) => {
		const ref = db.collection(`seasons/${season}/planets`).where('position.galaxy', '==', galaxy);
		const planets = await ref.get();

		return planets.docs.map((doc) => parsePlanet(doc));
	},

	getPlanet: async (tx: Transaction, season: number, planetId: string) => {
		const ref = db.doc(`seasons/${season}/planets/${planetId}`);
		const planet = await tx.get(ref);
		return parsePlanet(planet);
	},

	countUserPlanets: async (tx: Transaction, season: number, userId: string) => {
		const ref = db.collection(`seasons/${season}/planets`).where('owner_id', '==', userId);
		const planets = await tx.get(ref);
		return planets.size;
	},

	setPlanet: async (
		tx: Transaction,
		season: number,
		planetId: string,
		data: PartialWithFieldValue<Planet>,
		merge = true
	) => {
		const ref = db.doc(`seasons/${season}/planets/${planetId}`);
		tx.set(ref, _.omit(data, 'id'), { merge });
	},

	// Researchs
	getUserResearchs: async (tx: Transaction, userId: string) => {
		const ref = db.doc(`users/${userId}/private/researchs`);
		const researchs = await tx.get(ref);
		return researchs.data() as UserResearchs;
	},

	setUserResearchs: (tx: Transaction, userId: string, data: PartialWithFieldValue<UserResearchs>, merge = true) => {
		const ref = db.doc(`users/${userId}/private/researchs`);
		tx.set(ref, data, { merge });
	},

	// Tasks
	getUserTasks: async (tx: Transaction, userId: string) => {
		const ref = db.doc(`users/${userId}/private/tasks`);
		const tasks = await tx.get(ref);
		return parseUserTasks(tasks);
	},

	setUserTasks: async (tx: Transaction, userId: string, data: PartialWithFieldValue<UserTasks>) => {
		const ref = db.doc(`users/${userId}/private/tasks`);
		tx.set(ref, data, { merge: true });
	},

	// Chat messages
	getChatMessages: async (tx: Transaction, id: string) => {
		const ref = db.collection('chat').doc(id);
		const messages = await tx.get(ref);

		if (!messages.exists) {
			throw new Error('Chat messages not found');
		}

		return messages.data() as ChatMessage[];
	},

	createChatMessage: (tx: Transaction, data: PartialWithFieldValue<ChatMessage>) => {
		const ref = db.collection('chat').doc();
		tx.set(ref, data);
	},

	setChatMessage: (tx: Transaction, id: string, data: PartialWithFieldValue<ChatMessage>) => {
		const ref = db.collection('chat').doc(id);
		tx.set(ref, data, { merge: true });
	},

	// User rewards
	getUserRewards: async (tx: Transaction, userId: string) => {
		const ref = db.collection('users').doc(userId).collection('rewards');
		const rewards = await tx.get(ref);

		return rewards.docs.map((doc) => parseUserReward(doc));
	},

	getUserReward: async (tx: Transaction, userId: string, rewardId: string) => {
		const ref = db.collection('users').doc(userId).collection('rewards').doc(rewardId);
		const reward = await tx.get(ref);
		return parseUserReward(reward);
	},

	createUserReward: (tx: Transaction, userId: string, data: PartialWithFieldValue<UserReward>) => {
		const ref = admin.firestore().collection(`users/${userId}/rewards`).doc();
		tx.set(ref, data);
		return ref.id;
	},

	deleteUserReward: (tx: Transaction, userId: string, rewardId: string) => {
		const ref = db.collection('users').doc(userId).collection('rewards').doc(rewardId);
		tx.delete(ref);
	},

	// Inventory
	getUserInventory: async (tx: Transaction, userId: string) => {
		const ref = db.doc(`users/${userId}/private/inventory`);
		const inventory = await tx.get(ref);
		return parseUserInventory(inventory);
	},

	setUserInventory: (tx: Transaction, userId: string, data: PartialWithFieldValue<UserInventory>) => {
		const ref = db.doc(`users/${userId}/private/inventory`);
		tx.set(ref, data, { merge: true });
	},

	// Mails
	getUserMails: async (tx: Transaction, userId: string) => {
		const ref = db.collection(`users/${userId}/mails`);
		const mails = await tx.get(ref);
		return mails.docs.map((doc) => parseMail(doc));
	},

	getUserMail: async (tx: Transaction, userId: string, mailId: string) => {
		const ref = db.collection(`users/${userId}/mails`).doc(mailId);
		const mail = await tx.get(ref);
		return parseMail(mail);
	},

	createUserMail: (tx: Transaction, userId: string, data: PartialWithFieldValue<Mail>) => {
		const ref = db.collection(`users/${userId}/mails`).doc();
		tx.set(ref, data);
		return ref.id;
	},

	setUserMail: (tx: Transaction, userId: string, mailId: string, data: PartialWithFieldValue<Mail>) => {
		const ref = db.collection(`users/${userId}/mails`).doc(mailId);
		tx.set(ref, data, { merge: true });
	},

	deleteUserMail: (tx: Transaction, userId: string, mailId: string) => {
		const ref = db.collection(`users/${userId}/mails`).doc(mailId);
		tx.delete(ref);
	},

	// Shipyard queue
	getShipyardQueue: async (tx: Transaction, season: number, planetId: string) => {
		const ref = db.doc(`seasons/${season}/planets/${planetId}/private/shipyard_queue`);
		const shipyardQueue = await tx.get(ref);
		return parseShipyardQueue(planetId, shipyardQueue);
	},

	setShipyardQueue: async (
		tx: Transaction,
		season: number,
		planetId: string,
		data: PartialWithFieldValue<ShipyardQueue>
	) => {
		const ref = db.doc(`seasons/${season}/planets/${planetId}/private/shipyard_queue`);
		tx.set(ref, data, { merge: true });
	},

	// Fleet movements
	createFleetMovement: (tx: Transaction, season: number, movement: Omit<FleetMovement, 'id'>) => {
		const ref = admin.firestore().collection(`seasons/${season}/fleet_movements`).doc();
		tx.set(ref, movement);
		return ref.id;
	},

	getFleetMovement: async (tx: Transaction, season: number, movementId: string): Promise<FleetMovement> => {
		const doc = await tx.get(admin.firestore().collection(`seasons/${season}/fleet_movements`).doc(movementId));
		return parseFleetMovement(doc);
	},

	getFleetMovementsByShipId: async (tx: Transaction, season: number, shipId: string): Promise<FleetMovement[]> => {
		const ref = admin
			.firestore()
			.collection(`seasons/${season}/fleet_movements`)
			.where('ship_ids', 'array-contains', shipId);
		const movements = await tx.get(ref);
		return movements.docs.map(parseFleetMovement);
	},

	updateFleetMovement: (tx: Transaction, season: number, movementId: string, data: Partial<FleetMovement>) => {
		const ref = admin.firestore().collection(`seasons/${season}/fleet_movements`).doc(movementId);
		tx.update(ref, data);
	},

	deleteFleetMovement: (tx: Transaction, season: number, movementId: string) => {
		const ref = admin.firestore().collection(`seasons/${season}/fleet_movements`).doc(movementId);
		tx.delete(ref);
	},
};
