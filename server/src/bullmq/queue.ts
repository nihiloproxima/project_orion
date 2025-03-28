import { Queue } from 'bullmq';

const queue = new Queue('default', {
	connection: {
		url: process.env.REDIS_URL,
		retryStrategy: (times) => {
			const delay = Math.min(times * 50, 2000);
			console.log(`Reconnecting to Redis Queue... (attempt ${times})`);
			return delay;
		},
	},
});

queue.on('error', (err) => {
	console.error('Queue Error:', err);
});

export const addJob = async (type: string, data: any, delayMs: number = 0) => {
	return queue.add(
		type,
		{
			type,
			data,
			timestamp: Date.now(),
		},
		{
			delay: delayMs + 100, // Add a small delay to avoid race condition
			removeOnComplete: true,
			attempts: 5,
			backoff: {
				type: 'exponential',
				delay: 1000,
			},
		}
	);
};

export default queue;
