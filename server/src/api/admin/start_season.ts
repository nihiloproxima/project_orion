import db from '../../database/db';
import _ from 'lodash';
import admin from 'firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import Joi from 'joi';
import planetGenerator from '../../generators/planet_generator';

interface StartSeasonParams {
	season: number;
	start_at_ms: number;
	end_at_ms: number;
}

const schema = Joi.object<StartSeasonParams>({
	season: Joi.number().required(),
	start_at_ms: Joi.number().required(),
	end_at_ms: Joi.number().required(),
});

export async function startSeason(body: StartSeasonParams) {
	const params = Joi.attempt(body, schema);

	const gameConfig = await db.getGameConfig();

	await admin.firestore().runTransaction(async (tx) => {
		gameConfig.season.current++;
		gameConfig.season.next_start_at = Timestamp.fromMillis(params.start_at_ms);
		gameConfig.season.end_at = Timestamp.fromMillis(params.end_at_ms);

		db.setGameConfig(tx, gameConfig);
	});

	const planets = planetGenerator.generatePlanets();

	for (const chunk of _.chunk(planets, 500)) {
		const batch = admin.firestore().batch();

		for (const planet of chunk) {
			const planetRef = admin.firestore().collection(`seasons/${params.season}/planets`).doc();
			batch.set(planetRef, planet);
		}

		await batch.commit();
	}

	return {
		status: 'ok',
	};
}
