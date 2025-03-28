import admin from 'firebase-admin';
import logger from './logger';
import { FastifyReply, FastifyRequest } from 'fastify';

export async function isAuthed(
	req: FastifyRequest<{
		Params: {
			functionName: string;
		};
		Querystring: {
			userId?: string;
		};
	}>,
	reply: FastifyReply
): Promise<string | void> {
	if (process.env.NODE_ENV === 'development' && req.query.userId) {
		logger.info(`${req.url} (token verification skipped)`);
		return req.query.userId;
	}

	try {
		const decodedToken = await admin.auth().verifyIdToken(req.headers.authorization || '');

		return decodedToken.uid;
	} catch (e) {
		logger.error(e);
		return reply.status(401).send({
			status: 'error',
			errorMessage: e,
		});
	}
}
