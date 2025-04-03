import admin from 'firebase-admin';
import db from '../../database/db';
import { DEFAULT_GAME_CONFIG } from '../../rules/constants';

export async function resetGameConfig() {
	const gameConfig = DEFAULT_GAME_CONFIG;

	await admin.firestore().runTransaction(async (tx) => {
		await db.setGameConfig(tx, gameConfig);
	});

	return {
		status: 'ok',
	};
}
