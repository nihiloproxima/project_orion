import Joi from 'joi';
import db from '../../database/db';
import admin from 'firebase-admin';
import planetCalculations from '../../rules/planet_calculations';
import utils from '../../rules/utils';

interface CollectRewardParams {
	reward_id: string;
}

const schema = Joi.object<CollectRewardParams>({
	reward_id: Joi.string().required(),
});

export async function collectReward(userId: string, body: CollectRewardParams) {
	const params = Joi.attempt(body, schema);

	const gameConfig = await db.getGameConfig();

	await admin.firestore().runTransaction(async (tx) => {
		const [user, inventory, userReward] = await Promise.all([
			db.getUser(tx, userId),
			db.getUserInventory(tx, userId),
			db.getUserReward(tx, userId, params.reward_id),
		]);

		const reward = userReward.data;

		switch (reward.type) {
			case 'credits': {
				inventory.credits += reward.credits;
				db.setUserInventory(tx, userId, inventory);
				break;
			}
			case 'resources': {
				const planetId = reward.planet_id || user.home_planet_id;
				if (!planetId) {
					throw new Error('Planet not found');
				}

				const [userResearchs, planet] = await Promise.all([
					db.getUserResearchs(tx, userId),
					db.getPlanet(tx, gameConfig.season.current, planetId),
				]);

				planetCalculations.calculatePlanetResources(gameConfig, planet, userResearchs);

				for (const [resourceType, amount] of Object.entries(reward.resources)) {
					planet.resources[resourceType] += amount;
				}

				db.setPlanet(tx, gameConfig.season.current, planet.id, planet);
				break;
			}
			case 'xp': {
				user.xp += reward.xp;
				user.level = utils.calculateUserLevel(user.xp);
				db.setUser(tx, userId, user);
				break;
			}
		}

		db.deleteUserReward(tx, userId, params.reward_id);
	});

	return {
		status: 'ok',
	};
}
