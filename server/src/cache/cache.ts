import db from '../database/db';
import { GameConfig, Planet } from 'shared-types';
import redisClient from './redis';

const rankingCacheKey = (season: number, page: number) => `seasons:${season}:ranking_cache:${page}`;
const userScoresKey = (season: number) => `seasons:${season}:user_scores`;

export default {
	getGameConfig: async () => {
		const gameConfig = await redisClient.get('config:game');
		if (gameConfig) {
			return JSON.parse(gameConfig) as GameConfig;
		}

		return null;
	},

	setGameConfig: async (gameConfig: GameConfig) => {
		await redisClient.setEx('config:game', 60 * 60, JSON.stringify(gameConfig));
	},

	setUserScore: async (season: number, userId: string, score: number) => {
		const key = userScoresKey(season);
		await redisClient.zAdd(key, { score, value: userId });
	},

	getUserRank: async (season: number, userId: string) => {
		const key = userScoresKey(season);
		const rank = await redisClient.zRevRank(key, userId);

		return rank;
	},

	getUsersRanking: async (season: number, page: number) => {
		const cacheKey = rankingCacheKey(season, page);
		const cachedRanking = await redisClient.get(cacheKey);
		if (cachedRanking) {
			return JSON.parse(cachedRanking);
		}

		const USERS_PER_PAGE = 25;
		const offset = (page - 1) * USERS_PER_PAGE;
		const limit = USERS_PER_PAGE;

		const scoresKey = userScoresKey(season);
		const ranking = await redisClient.zRangeWithScores(scoresKey, offset, offset + limit, {
			REV: true,
		});

		const rankingWithUserIds = await Promise.all(
			ranking.map(async (item, index) => {
				try {
					const user = await db.getUserNoTx(item.value);

					return {
						rank: index + offset + 1,
						user_id: item.value,
						score: item.score,
						name: user.name,
						avatar: user.avatar,
					};
				} catch (error) {
					console.error(error);
					return null;
				}
			})
		);

		const filteredRanking = rankingWithUserIds.filter((item) => item !== null);

		await redisClient.set(cacheKey, JSON.stringify(filteredRanking));

		return filteredRanking;
	},

	getPlanetsFromGalaxy: async (season: number, galaxy: number): Promise<Planet[]> => {
		const cacheKey = `seasons:${season}:planets:galaxy:${galaxy}`;
		const cachedPlanets = await redisClient.hGetAll(cacheKey);
		if (Object.keys(cachedPlanets).length > 0) {
			return Object.values(cachedPlanets).map((planet) => JSON.parse(planet));
		}

		const planets = await db.getPlanetsFromGalaxyNoTx(season, galaxy);

		const planetEntries = planets.reduce((acc, planet) => {
			acc[planet.id] = JSON.stringify(planet);
			return acc;
		}, {} as Record<string, string>);

		if (Object.keys(planetEntries).length > 0) {
			await redisClient.hSet(cacheKey, planetEntries);
		}

		return planets;
	},

	updatePlanet: async (season: number, galaxy: number, planetId: string, planet: Planet) => {
		const cacheKey = `seasons:${season}:planets:galaxy:${galaxy}`;
		await redisClient.hSet(cacheKey, planetId, JSON.stringify(planet));
	},

	clearPlanetsFromGalaxy: async (season: number, galaxy: number) => {
		const cacheKey = `seasons:${season}:planets:galaxy:${galaxy}`;
		await redisClient.del(cacheKey);
	},
};
