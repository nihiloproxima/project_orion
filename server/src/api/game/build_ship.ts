import admin from 'firebase-admin';
import Joi from 'joi';
import _ from 'lodash';
import db from '../../database/db';
import assert from '../../rules/asserts';
import planetCalculations from '../../rules/planet_calculations';
import { Timestamp } from 'firebase-admin/firestore';
import { ShipType, ShipyardQueueCommand } from 'shared-types';
import utils from '../../rules/utils';
import { addJob } from 'server/src/bullmq/queue';

interface BuildShipParams {
	planet_id: string;
	ship_type: ShipType;
	count: number;
}

const schema = Joi.object<BuildShipParams>({
	planet_id: Joi.string().required(),
	ship_type: Joi.string().required(),
	count: Joi.number().required(),
});

export async function buildShip(userId: string, body: BuildShipParams) {
	const params = Joi.attempt(body, schema);

	const gameConfig = await db.getGameConfig();

	const itemFinishTime = await admin.firestore().runTransaction(async (tx) => {
		const [planet, shipyardQueue, userResearchs] = await Promise.all([
			db.getPlanet(tx, gameConfig.season.current, params.planet_id),
			db.getShipyardQueue(tx, gameConfig.season.current, params.planet_id),
			db.getUserResearchs(tx, userId),
		]);

		const shipConfig = utils.getShipConfig(gameConfig, params.ship_type);

		planetCalculations.calculatePlanetResources(gameConfig, planet, userResearchs);

		assert.isGreaterThan(shipyardQueue.capacity, shipyardQueue.commands.length, 'Shipyard queue is full');
		assert.isEqual(planet.owner_id, userId, 'User does not own this planet');

		assert.isGreaterThanOrEqual(shipConfig.construction.metal, planet.resources.metal, 'Not enough metal');
		assert.isGreaterThanOrEqual(
			shipConfig.construction.microchips,
			planet.resources.microchips,
			'Not enough microchips'
		);

		planet.resources.metal -= shipConfig.construction.metal;
		planet.resources.microchips -= shipConfig.construction.microchips;
		db.setPlanet(tx, gameConfig.season.current, params.planet_id, planet);

		const command: ShipyardQueueCommand = {
			ship_type: params.ship_type,
			count: params.count,
			current_item_start_time: Timestamp.now(),
			current_item_finish_time: Timestamp.fromMillis(
				Date.now() + utils.secondsToMs(shipConfig.construction.seconds)
			),
			construction_start_time: Timestamp.now(),
			construction_finish_time: Timestamp.fromMillis(
				Date.now() + utils.secondsToMs(shipConfig.construction.seconds * params.count)
			),
		};
		shipyardQueue.commands.push(command);
		db.setShipyardQueue(tx, gameConfig.season.current, params.planet_id, shipyardQueue);

		return command.current_item_finish_time.toMillis();
	});

	await addJob(
		'processShipyardQueue',
		{
			planet_id: params.planet_id,
			item_finish_time: itemFinishTime,
		},
		itemFinishTime - Date.now()
	);

	return {
		status: 'ok',
	};
}
