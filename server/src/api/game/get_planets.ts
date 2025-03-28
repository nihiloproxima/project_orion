import db from '../../database/db';
import Joi from 'joi';
import cache from '../../cache/cache';

interface GetPlanetsParams {
	galaxy: number;
	intent: 'all' | 'attack' | 'spy' | 'colonize' | 'transport';
}

const getPlanetsSchema = Joi.object({
	galaxy: Joi.number().required(),
	intent: Joi.string().valid('all', 'attack', 'spy', 'colonize', 'transport').required(),
});

export async function getPlanets(userId: string, body: GetPlanetsParams) {
	const params = Joi.attempt(body, getPlanetsSchema);

	const gameConfig = await db.getGameConfig();
	const planets = await cache.getPlanetsFromGalaxy(gameConfig?.season.current || 1, params.galaxy);

	const filteredPlanets = planets.filter((planet) => {
		if (params.intent === 'all') return true;
		if (params.intent === 'attack') return planet.owner_id !== null && planet.owner_id !== userId;
		if (params.intent === 'spy') return planet.owner_id !== userId && planet.owner_id !== null;
		if (params.intent === 'colonize') return planet.owner_id === null;
		if (params.intent === 'transport') return planet.owner_id === userId;

		return false;
	});

	return {
		status: 'ok',
		planets: filteredPlanets,
	};
}
