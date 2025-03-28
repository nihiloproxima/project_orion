import db from '../../database/db';
import Joi from 'joi';
import admin from 'firebase-admin';
import assert from '../../rules/asserts';

interface RenameShipParams {
	ship_id: string;
	name: string;
}

const schema = Joi.object<RenameShipParams>({
	ship_id: Joi.string().required(),
	name: Joi.string().required(),
});

export async function renameShip(userId: string, body: RenameShipParams) {
	const params = Joi.attempt(body, schema);

	const gameConfig = await db.getGameConfig();
	await admin.firestore().runTransaction(async (tx) => {
		const ship = await db.getShip(tx, gameConfig.season.current, params.ship_id);

		assert.isEqual(ship.owner_id, userId, 'You are not the owner of this ship');

		await db.setShip(tx, gameConfig.season.current, ship.id, { name: params.name });
	});

	return {
		status: 'ok',
	};
}
