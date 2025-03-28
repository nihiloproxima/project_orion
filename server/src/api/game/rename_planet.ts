import Joi from 'joi';
import admin from 'firebase-admin';
import db from '../../database/db';
import assert from '../../rules/asserts';

interface RenamePlanetRequest {
	planet_id: string;
	new_name: string;
}

const schema = Joi.object<RenamePlanetRequest>({
	planet_id: Joi.string().required(),
	new_name: Joi.string().required(),
});

export async function renamePlanet(userId: string, body: RenamePlanetRequest) {
	const params = Joi.attempt(body, schema);

	const gameConfig = await db.getGameConfig();

	await admin.firestore().runTransaction(async (tx) => {
		const planet = await db.getPlanet(tx, gameConfig.season.current, params.planet_id);

		assert.isEqual(planet.owner_id, userId, 'User does not own this planet');

		db.setPlanet(tx, gameConfig.season.current, params.planet_id, { name: params.new_name });
	});

	return {
		status: 'ok',
	};
}
