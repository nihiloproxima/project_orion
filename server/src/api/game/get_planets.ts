import db from '../../database/db';
import _ from 'lodash';
import admin from 'firebase-admin';
import Joi from 'joi';
import cache from '../../cache/cache';

interface GetPlanetsParams {
	intent: 'all' | 'attack' | 'spy' | 'colonize' | 'transport';
	planet_ids?: string[];
}

const getPlanetsSchema = Joi.object<GetPlanetsParams>({
	intent: Joi.string().valid('all', 'attack', 'spy', 'colonize', 'transport').required(),
	planet_ids: Joi.array().items(Joi.string()).optional(),
});

export async function getPlanets(userId: string, body: GetPlanetsParams) {
	const params = Joi.attempt(body, getPlanetsSchema);

	const gameConfig = await db.getGameConfig();

	const user = await admin.firestore().runTransaction(async (tx) => db.getUser(tx, userId));
	const planets = _.compact(
		await Promise.all(
			user.discovered_chunks.map(async (chunk) =>
				cache.getPlanetsFromChunk(gameConfig?.season.current || 1, chunk)
			)
		)
	).flat();

	const filteredPlanets = planets
		.filter((p) => user.discovered_chunks.includes(p.position.chunk))
		.filter((planet) => {
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
