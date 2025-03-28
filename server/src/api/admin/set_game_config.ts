import admin from 'firebase-admin';
import _ from 'lodash';
import Joi from 'joi';
import { GameConfig } from '../../models';
import db from '../../database/db';

interface SetGameConfigParams {
	game_config: Partial<GameConfig>;
}

const schema = Joi.object<SetGameConfigParams>({
	game_config: Joi.object<GameConfig>().required(),
});

export async function setGameConfig(body: SetGameConfigParams) {
	const params = Joi.attempt(body, schema);

	const gameConfig = await db.getGameConfig();

	const data = await admin.firestore().runTransaction(async (tx) => {
		const data = _.merge(gameConfig, params.game_config);

		db.setGameConfig(tx, data);
		return data;
	});

	return data;
}
