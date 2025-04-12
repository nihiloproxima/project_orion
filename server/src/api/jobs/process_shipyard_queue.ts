import admin from 'firebase-admin';
import Joi from 'joi';
import db from '../../database/db';
import utils from 'server/src/rules/utils';
import { Timestamp } from 'firebase-admin/firestore';
import { addJob } from 'server/src/bullmq/queue';

interface ProcessShipyardQueueParams {
	planet_id: string;
	item_finish_time: number;
}

const schema = Joi.object<ProcessShipyardQueueParams>({
	planet_id: Joi.string().required(),
	item_finish_time: Joi.number().required(),
});

export async function processShipyardQueue(data: ProcessShipyardQueueParams) {
	const params = Joi.attempt(data, schema);

	const gameConfig = await db.getGameConfig();

	const job = await admin.firestore().runTransaction(async (tx) => {
		const [planet, shipyardQueue] = await Promise.all([
			db.getPlanet(tx, gameConfig.season.current, params.planet_id),
			db.getShipyardQueue(tx, gameConfig.season.current, params.planet_id),
		]);

		const command = shipyardQueue.commands.at(0);

		if (!command) {
			return null;
		}

		if (command.current_item_finish_time.toMillis() !== params.item_finish_time) {
			console.error(`Command finish time does not match with item finish time`);
			return null;
		}

		const shipConfig = utils.getShipConfig(gameConfig, command.ship_type);

		planet.ships[command.ship_type] = (planet.ships[command.ship_type] || 0) + command.count;
		db.setPlanet(tx, gameConfig.season.current, params.planet_id, planet);

		command.count -= 1;

		// If there are still items to build, schedule the next item job
		if (command.count > 0) {
			command.current_item_start_time = Timestamp.now();
			command.current_item_finish_time = Timestamp.fromMillis(
				Date.now() + utils.secondsToMs(shipConfig.construction.seconds)
			);
			db.setShipyardQueue(tx, gameConfig.season.current, params.planet_id, shipyardQueue);

			return {
				planet_id: params.planet_id,
				item_finish_time: command.current_item_finish_time.toMillis(),
			};
		} else {
			shipyardQueue.commands.shift();
			db.setShipyardQueue(tx, gameConfig.season.current, params.planet_id, shipyardQueue);
		}
	});

	if (job) {
		await addJob('processShipyardQueue', job, job.item_finish_time - Date.now());
	}

	return {
		status: 'ok',
	};
}
