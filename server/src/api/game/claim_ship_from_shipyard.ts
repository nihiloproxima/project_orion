import Joi from 'joi';
import admin from 'firebase-admin';
import db from '../../database/db';
import _ from 'lodash';
import assert from '../../rules/asserts';

interface ClaimShipFromShipyardParams {
	planet_id: string;
	command_index: number;
}

const schema = Joi.object<ClaimShipFromShipyardParams>({
	planet_id: Joi.string().required(),
	command_index: Joi.number().required(),
});

export async function claimShipFromShipyard(userId: string, body: ClaimShipFromShipyardParams) {
	const params = Joi.attempt(body, schema);

	const gameConfig = await db.getGameConfig();

	await admin.firestore().runTransaction(async (tx) => {
		const [planet, shipyardQueue] = await Promise.all([
			db.getPlanet(tx, gameConfig.season.current, params.planet_id),
			db.getShipyardQueue(tx, gameConfig.season.current, params.planet_id),
		]);

		assert.isEqual(planet.owner_id, userId, 'User does not own this planet');

		if (shipyardQueue.commands.length === 0) {
			return;
		}

		const command = shipyardQueue.commands[params.command_index];

		if (!command) {
			throw new Error(`Command not found`);
		}

		if (command.construction_finish_time.toMillis() > Date.now()) {
			throw new Error(`Command is not finished`);
		}

		db.createShip(tx, gameConfig.season.current, _.omit(command.ship, 'id'));
		db.setShipyardQueue(tx, gameConfig.season.current, params.planet_id, {
			commands: shipyardQueue.commands.filter((_, index) => index !== params.command_index),
		});
	});

	return {
		status: 'ok',
	};
}
