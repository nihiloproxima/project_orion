import Joi from 'joi';
import admin from 'firebase-admin';
import db from '../../database/db';
import { UserResearchs } from '../../models/user_researchs';

interface CreateUserParams {
	name: string;
	avatar: number;
}

const schema = Joi.object<CreateUserParams>({
	name: Joi.string().required(),
	avatar: Joi.number().required(),
});

export async function createUser(userId: string, body: CreateUserParams) {
	const params = Joi.attempt(body, schema);

	const gameConfig = await db.getGameConfig();

	await admin.firestore().runTransaction(async (tx) => {
		const checkUserExists = await db.checkUserExists(tx, userId);
		const unclaimedPlanet = await db.getUnclaimedPlanet(tx, gameConfig.season.current);

		if (checkUserExists) {
			throw new Error('User already exists');
		}

		if (!unclaimedPlanet) {
			throw new Error('No unclaimed planet found');
		}

		const userResearchs: UserResearchs = {
			technologies: {},
			capacity: 0,
		};

		for (const tech of gameConfig.researchs) {
			userResearchs.technologies[tech.id] = {
				level: 0,
				is_researching: false,
				research_start_time: null,
				research_finish_time: null,
				researching_planet_id: null,
				researching_planet_name: null,
			};
		}
		db.setUserResearchs(tx, userId, userResearchs);

		db.setUser(tx, userId, {
			name: params.name,
			avatar: params.avatar,
			xp: 0,
			level: 1,
			home_planet_id: unclaimedPlanet.id,
			discovered_chunks: [unclaimedPlanet.position.chunk],
			season: gameConfig.season.current,
			onboarding_step: 'check-mails',
			created_at: admin.firestore.Timestamp.now(),
			updated_at: admin.firestore.Timestamp.now(),
		});

		db.setPlanet(tx, gameConfig.season.current, unclaimedPlanet.id, {
			owner_id: userId,
			owner_name: params.name,
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

		db.setUserInventory(tx, userId, {
			credits: 0,
		});
	});

	return {
		status: 'ok',
	};
}
