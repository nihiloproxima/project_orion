import Joi from 'joi';
import db from '../../database/db';
import admin from 'firebase-admin';
import { User } from 'shared-types';

interface UpdateUserParams {
	name?: User['name'];
	avatar?: User['avatar'];
}

const schema = Joi.object<UpdateUserParams>({
	name: Joi.string().optional(),
	avatar: Joi.string().optional(),
});

export async function updateUser(userId: string, body: UpdateUserParams) {
	const params = Joi.attempt(body, schema);

	await admin.firestore().runTransaction(async (tx) => {
		const user = await db.getUser(tx, userId);

		if (params.name) {
			user.name = params.name;
		}

		if (params.avatar) {
			user.avatar = params.avatar;
		}

		db.setUser(tx, userId, user);
	});

	return {
		status: 'ok',
	};
}
