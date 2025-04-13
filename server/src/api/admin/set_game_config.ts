import admin from 'firebase-admin';
import _ from 'lodash';
import Joi from 'joi';
import { GameConfig } from '../../models';
import db from '../../database/db';
import { DEFAULT_GAME_CONFIG } from '../../rules/constants';

interface SetGameConfigParams {
	game_config?: Partial<GameConfig>;
	use_default: boolean;
}

const schema = Joi.object<SetGameConfigParams>({
	game_config: Joi.object<GameConfig>().optional(),
	use_default: Joi.boolean().required(),
});

export async function setGameConfig(body: SetGameConfigParams) {
	const params = Joi.attempt(body, schema);

	if (params.use_default) {
		await admin.firestore().runTransaction(async (tx) => {
			db.setGameConfig(tx, DEFAULT_GAME_CONFIG);
		});
		return {
			status: 'ok',
		};
	}

	const gameConfig = await db.getGameConfig();

	await admin.firestore().runTransaction(async (tx) => {
		const data = _.merge(gameConfig, params.game_config);

		db.setGameConfig(tx, data);
		return data;
	});

	return {
		status: 'ok',
	};
}
