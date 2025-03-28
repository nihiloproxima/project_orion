import Joi from 'joi';
import admin from 'firebase-admin';
import db from '../../database/db';

interface SendChatMessageParams {
	text: string;
	channel_id: string;
}

const schema = Joi.object<SendChatMessageParams>({
	text: Joi.string().required(),
	channel_id: Joi.string().required(),
});

export async function sendChatMessage(userId: string, body: SendChatMessageParams) {
	const params = Joi.attempt(body, schema);

	await admin.firestore().runTransaction(async (tx) => {
		const user = await db.getUser(tx, userId);

		db.createChatMessage(tx, {
			sender: {
				id: user.id,
				name: user.name,
				avatar: user.avatar,
			},
			text: params.text,
			channel_id: params.channel_id,
			created_at: admin.firestore.Timestamp.now(),
		});
	});

	return {
		status: 'ok',
	};
}
