import Joi from 'joi';
import admin from 'firebase-admin';
import db from '../../database/db';
import { UserResearchs } from 'shared-types';

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

	await admin.firestore().runTransaction(async (tx) => {
		const gameConfig = await db.getGameConfig();
		const checkUserExists = await db.checkUserExists(tx, userId);
		if (checkUserExists) {
			throw new Error('User already exists');
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
			home_planet_id: null,
			season: gameConfig.season.current,
			created_at: admin.firestore.Timestamp.now(),
			updated_at: admin.firestore.Timestamp.now(),
		});
	});

	return {
		status: 'ok',
	};
}
