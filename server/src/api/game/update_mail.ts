import Joi from 'joi';
import admin from 'firebase-admin';
import db from '../../database/db';

interface UpdateMailParams {
	mail_id: string;
	read?: boolean;
	deleted?: boolean;
	archived?: boolean;
}

const schema = Joi.object<UpdateMailParams>({
	mail_id: Joi.string().required(),
	read: Joi.boolean().optional(),
	deleted: Joi.boolean().optional(),
	archived: Joi.boolean().optional(),
});

export async function updateMail(userId: string, body: UpdateMailParams) {
	const params = Joi.attempt(body, schema);

	await admin.firestore().runTransaction(async (tx) => {
		const mail = await db.getUserMail(tx, userId, params.mail_id);

		if (!mail) {
			throw new Error('Mail not found');
		}

		if (params.read) {
			mail.read = params.read;
			db.setUserMail(tx, userId, params.mail_id, mail);
		}

		if (params.archived) {
			mail.archived = params.archived;
			db.setUserMail(tx, userId, params.mail_id, mail);
		}

		if (params.deleted) {
			db.deleteUserMail(tx, userId, params.mail_id);
		}
	});

	return {
		status: 'ok',
	};
}
