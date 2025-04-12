import Joi from 'joi';
import admin from 'firebase-admin';
import db from '../../database/db';
import assert from '../../rules/asserts';

interface SelectHomeworldParams {
	planet_id: string;
}

const schema = Joi.object<SelectHomeworldParams>({
	planet_id: Joi.string().required(),
});

export async function selectHomeworld(userId: string, body: SelectHomeworldParams) {
	const params = Joi.attempt(body, schema);

	const gameConfig = await db.getGameConfig();

	await admin.firestore().runTransaction(async (tx) => {
		const [user, planet] = await Promise.all([
			db.getUser(tx, userId),
			db.getPlanet(tx, gameConfig.season.current, params.planet_id),
		]);

		assert.isEqual(user.home_planet_id, null, 'User already has a home planet');
		assert.isEqual(planet.owner_id, null, 'Planet already has an owner');

		db.updateUser(tx, userId, {
			home_planet_id: params.planet_id,
		});

		db.setPlanet(tx, gameConfig.season.current, params.planet_id, {
			owner_id: userId,
			owner_name: user.name,
			is_homeworld: true,
			resources: {
				metal: 500,
				deuterium: 250,
				microchips: 0,
				energy: 15,
				last_update: admin.firestore.Timestamp.now(),
			},
			structures: [
				{
					type: 'metal_mine',
					level: 0,
					production_rate: 100,
					construction_start_time: null,
					construction_finish_time: null,
				},
				{
					type: 'energy_plant',
					level: 0,
					production_rate: 100,
					construction_start_time: null,
					construction_finish_time: null,
				},
				{
					type: 'deuterium_synthesizer',
					level: 0,
					production_rate: 100,
					construction_start_time: null,
					construction_finish_time: null,
				},
				{
					type: 'microchip_factory',
					level: 0,
					production_rate: 100,
					construction_start_time: null,
					construction_finish_time: null,
				},
				{
					type: 'research_lab',
					level: 0,
					production_rate: 100,
					construction_start_time: null,
					construction_finish_time: null,
				},
				{
					type: 'shipyard',
					level: 0,
					production_rate: 100,
					construction_start_time: null,
					construction_finish_time: null,
				},
				{
					type: 'metal_hangar',
					level: 0,
					production_rate: 100,
					construction_start_time: null,
					construction_finish_time: null,
				},
				{
					type: 'deuterium_tank',
					level: 0,
					production_rate: 100,
					construction_start_time: null,
					construction_finish_time: null,
				},
				{
					type: 'microchip_vault',
					level: 0,
					production_rate: 100,
					construction_start_time: null,
					construction_finish_time: null,
				},
			],
			updated_at: admin.firestore.Timestamp.now(),
		});
	});

	return {
		status: 'ok',
	};
}
