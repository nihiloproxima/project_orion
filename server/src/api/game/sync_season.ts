import admin from 'firebase-admin';
import db from '../../database/db';
import cache from '../../cache/cache';
import { UserResearchs } from '../../models';

export async function syncSeason(userId: string) {
	const gameConfig = await db.getGameConfig();

	await admin.firestore().runTransaction(async (tx) => {
		const userRewards = await db.getUserRewards(tx, userId);

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
			home_planet_id: null,
		});

		db.setUserInventory(tx, userId, {
			credits: 0,
			ship_blueprints: [],
			ship_components: [],
		});

		userRewards.forEach((reward) => db.deleteUserReward(tx, userId, reward.id));
	});

	await cache.setUserScore(gameConfig.season.current, userId, 0);

	return {
		status: 'ok',
	};
}
