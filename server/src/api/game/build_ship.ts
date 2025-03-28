import admin from 'firebase-admin';
import Joi from 'joi';
import _ from 'lodash';
import db from '../../database/db';
import assert from '../../rules/asserts';
import planetCalculations from '../../rules/planet_calculations';
import generateShip from '../../generators/ship_generator';
import { Timestamp } from 'firebase-admin/firestore';
import { ShipyardQueueCommand } from '../../models';
import utils from '../../rules/utils';

interface BuildShipParams {
	planet_id: string;
	blueprint_id: string;
	components_ids: string[];
}

const schema = Joi.object<BuildShipParams>({
	planet_id: Joi.string().required(),
	blueprint_id: Joi.string().required(),
	components_ids: Joi.array().items(Joi.string()).required(),
});

export async function buildShip(userId: string, body: BuildShipParams) {
	const params = Joi.attempt(body, schema);

	const gameConfig = await db.getGameConfig();

	await admin.firestore().runTransaction(async (tx) => {
		const [user, planet, shipyardQueue, userInventory, userResearchs] = await Promise.all([
			db.getUser(tx, userId),
			db.getPlanet(tx, gameConfig.season.current, params.planet_id),
			db.getShipyardQueue(tx, gameConfig.season.current, params.planet_id),
			db.getUserInventory(tx, userId),
			db.getUserResearchs(tx, userId),
		]);

		planetCalculations.calculatePlanetResources(gameConfig, planet, userResearchs);

		const blueprint = _.remove(userInventory.ship_blueprints, { id: params.blueprint_id }).at(0);
		const components = _.remove(userInventory.ship_components, (c) => params.components_ids.includes(c.id));

		assert.isGreaterThan(shipyardQueue.capacity, shipyardQueue.commands.length, 'Shipyard queue is full');
		assert.isEqual(planet.owner_id, userId, 'User does not own this planet');
		assert.isNotEqual(blueprint, undefined, 'Blueprint not found');
		assert.isGreaterThanOrEqual(
			blueprint!.base_cost.credits,
			userInventory.credits,
			'User does not have enough credits'
		);
		assert.isEqual(components.length, params.components_ids.length, 'Some components not found');

		for (const resource in blueprint!.base_cost.resources) {
			if (resource) {
				assert.isGreaterThan(
					planet.resources[resource],
					blueprint!.base_cost.resources[resource],
					`User does not have enough ${resource}`
				);
				planet.resources[resource] -= blueprint!.base_cost.resources[resource];
			}
		}
		db.setPlanet(tx, gameConfig.season.current, params.planet_id, planet);

		userInventory.credits -= blueprint!.base_cost.credits;

		const ship = generateShip(user, blueprint!, components);
		const command: ShipyardQueueCommand = {
			ship,
			construction_start_time: Timestamp.now(),
			construction_finish_time: Timestamp.fromMillis(
				Date.now() + utils.secondsToMs(blueprint!.construction_seconds)
			),
			base_cost: blueprint!.base_cost,
		};
		shipyardQueue.commands.push(command);
		db.setShipyardQueue(tx, gameConfig.season.current, params.planet_id, shipyardQueue);
		db.setUserInventory(tx, userId, userInventory);
	});

	return {
		status: 'ok',
	};
}
