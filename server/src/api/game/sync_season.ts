import admin from 'firebase-admin';
import db from '../../database/db';
import cache from '../../cache/cache';
import { UserResearchs } from 'shared-types';

export async function syncSeason(userId: string) {
	const gameConfig = await db.getGameConfig();

	await admin.firestore().runTransaction(async (tx) => {
		const [user, userRewards, unclaimedPlanet] = await Promise.all([
			db.getUser(tx, userId),
			db.getUserRewards(tx, userId),
			db.getUnclaimedPlanet(tx, gameConfig.season.current),
		]);

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
			season: gameConfig.season.current,
			score: 0,
			home_planet_id: unclaimedPlanet.id,
			discovered_chunks: [unclaimedPlanet.position.chunk],
		});

		db.setUserInventory(tx, userId, {
			credits: 0,
		});

		db.setPlanet(tx, gameConfig.season.current, unclaimedPlanet.id, {
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

		userRewards.forEach((reward) => db.deleteUserReward(tx, userId, reward.id));
	});

	await cache.setUserScore(gameConfig.season.current, userId, 0);

	return {
		status: 'ok',
	};
}
