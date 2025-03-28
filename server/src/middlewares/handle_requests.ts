import { FastifyReply, FastifyRequest } from 'fastify';
import * as roles from './roles';
import * as gameFunction from '../api/game';
import * as adminFunction from '../api/admin';
import * as jobFunction from '../api/jobs';
import logger from './logger';

export const handleGameRequest = async (
	req: FastifyRequest<{
		Params: {
			functionName: string;
		};
		Querystring: {
			userId?: string;
		};
	}>,
	reply: FastifyReply
): Promise<any> => {
	let userId: string | void = 'unknown';
	try {
		const method: any = gameFunction[req.params.functionName];
		userId = await roles.isAuthed(req, reply);

		if (method && userId) {
			const result = await method(userId, req.body);

			logger.info(
				`${req.params.functionName}(${userId}, ${JSON.stringify(req.body)}) => ${JSON.stringify(result)}`
			);

			return reply.send(result);
		}

		return reply.status(404).send({
			status: 'error',
			message: `${req.method} ${req.url} not found.`,
		});
	} catch (e) {
		logger.error(`${req.params.functionName}(${userId ?? 'unknown'}, ${JSON.stringify(req.body)}): ${e}`, e);

		return reply.status(500).send({ status: 'error', message: `${e}` });
	}
};

export const handleAdminRequest = async (
	req: FastifyRequest<{ Params: { functionName: string } }>,
	reply: FastifyReply
) => {
	const method = adminFunction[req.params.functionName];
	if (method) {
		const response = await method(req.body);
		logger.info(`${req.params.functionName}(${JSON.stringify(req.body)}) => ${JSON.stringify(response)}`);
		return reply.send(response);
	}
	return reply.status(404).send({ status: 'error', message: 'Function not found' });
};

export const handleJobRequest = async (
	req: FastifyRequest<{ Params: { functionName: string } }>,
	reply: FastifyReply
) => {
	const method = jobFunction[req.params.functionName];
	if (method) {
		const response = await method(req.body);
		logger.info(`${req.params.functionName}(${JSON.stringify(req.body)}) => ${JSON.stringify(response)}`);
		return reply.send(response);
	}
	return reply.status(404).send({ status: 'error', message: 'Function not found' });
};
