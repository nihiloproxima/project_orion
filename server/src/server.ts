import * as dotenv from 'dotenv';

dotenv.config();

import Fastify from 'fastify';
import cors from '@fastify/cors';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { FastifyAdapter } from '@bull-board/fastify';
import queue from './bullmq/queue';
import { handleAdminRequest, handleGameRequest } from './middlewares/handle_requests';
import { setupSocket } from './socket/socket';
import { BaseAdapter } from '@bull-board/api/dist/src/queueAdapters/base';

const fastify = Fastify({
	logger: true,
});

// Add error handler
fastify.setErrorHandler((error, request, reply) => {
	fastify.log.error(error);
	reply.status(500).send({ error: 'Internal Server Error' });
});

fastify.register(cors, {
	origin: '*',
});

// Health check endpoint
fastify.get('/', async (request, reply) => {
	reply.send('Hello World');
});

// routes
fastify.post('/game/:functionName', handleGameRequest);
fastify.post('/admin/:functionName', handleAdminRequest);

// Set up BullBoard with Fastify adapter
const serverAdapter = new FastifyAdapter();
createBullBoard({
	queues: [new BullMQAdapter(queue) as BaseAdapter],
	serverAdapter,
});

// Set the base path for BullBoard UI
serverAdapter.setBasePath('/admin/queues');

// Register the plugin with the specified prefix
fastify.register(serverAdapter.registerPlugin(), {
	prefix: '/admin/queues',
	basePath: '/admin/queues',
});

// Add after fastify initialization
const io = setupSocket(fastify);

// Export for use in other files
export { io };

// Run the server!
const start = async () => {
	try {
		const address = await fastify.listen({
			port: Number(process.env.PORT) || 8080,
			host: '0.0.0.0',
		});
		console.log(`Server is now listening on ${address}`);
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
};

start();
