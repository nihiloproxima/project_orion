import Joi from 'joi';
import cache from '../../cache/cache';
import db from '../../database/db';

interface GetUserRankingParams {
	page: number;
}

const schema = Joi.object<GetUserRankingParams>({
	page: Joi.number().required(),
});

export async function getUserRanking(userId: string, body: GetUserRankingParams) {
	const params = Joi.attempt(body, schema);

	const gameConfig = await db.getGameConfig();

	return {
		status: 'ok',
		ranking: await cache.getUsersRanking(gameConfig.season.current, params.page),
		user_rank: await cache.getUserRank(gameConfig.season.current, userId),
	};
}
