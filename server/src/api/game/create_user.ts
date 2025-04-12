import Joi from 'joi';
import admin from 'firebase-admin';
import db from '../../database/db';

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
		const checkUserExists = await db.checkUserExists(tx, userId);
		if (checkUserExists) {
			throw new Error('User already exists');
		}

		db.setUser(tx, userId, {
			name: params.name,
			avatar: params.avatar,
			xp: 0,
			level: 1,
			home_planet_id: null,
			season: 0,
			created_at: admin.firestore.Timestamp.now(),
			updated_at: admin.firestore.Timestamp.now(),
		});
	});

	return {
		status: 'ok',
	};
}
